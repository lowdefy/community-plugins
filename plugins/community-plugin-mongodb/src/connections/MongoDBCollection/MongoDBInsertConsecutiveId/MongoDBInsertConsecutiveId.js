/*
  Copyright 2020-2023 Lowdefy, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import getCollection from '../getCollection.js';
import { serialize, deserialize } from '../serialize.js';
import schema from './schema.js';

async function insertDocument({
  blockId,
  connection,
  collection,
  doc,
  logCollection,
  options,
  pageId,
  payload,
  requestId,
  session,
}) {
  const response = await collection.insertOne(doc, { ...options, session });
  if (logCollection) {
    await logCollection.insertOne(
      {
        args: { doc, options },
        blockId,
        pageId,
        payload,
        requestId,
        response,
        timestamp: new Date(),
        type: 'MongoDBInsertConsecutiveId',
        meta: connection.changeLog?.meta,
      },
      { session }
    );
  }
  return response;
}

async function getId({ collection, length, prefix, session }) {
  const previous = await collection
    .aggregate(
      [
        { $match: { _id: { $regex: `^${prefix}\\d+$` } } },
        {
          $project: {
            index: { $toInt: { $replaceOne: { input: '$_id', find: prefix, replacement: '' } } },
          },
        },
        {
          $sort: {
            index: -1,
          },
        },
        { $limit: 1 },
      ],
      session
    )
    .toArray();
  const index = (previous?.[0]?.index ?? 0) + 1;
  return `${prefix}${String(index).padStart(length, '0')}`;
}

async function MongoDBInsertConsecutiveId({
  blockId,
  connection,
  pageId,
  request,
  requestId,
  payload,
}) {
  const deserializedRequest = deserialize(request);
  const { doc, options, prefix, length } = deserializedRequest;
  const { collection, client, logCollection } = await getCollection({ connection });

  const session = client.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
  };
  let response = {};
  try {
    await session.withTransaction(async () => {
      doc._id = await getId({ collection, length, prefix, session });
      response = await insertDocument({
        blockId,
        collection,
        connection,
        doc,
        logCollection,
        options,
        pageId,
        payload,
        requestId,
        session,
      });
    }, transactionOptions);
  } finally {
    await session.endSession();
    await client.close();
  }
  const { acknowledged, insertedId } = serialize(response);
  return { acknowledged, insertedId };
}

MongoDBInsertConsecutiveId.schema = schema;
MongoDBInsertConsecutiveId.meta = {
  checkRead: false,
  checkWrite: true,
};

export default MongoDBInsertConsecutiveId;
