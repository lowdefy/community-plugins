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

async function insertDocuments({
  blockId,
  connection,
  collection,
  docs,
  logCollection,
  options,
  pageId,
  payload,
  requestId,
  session,
}) {
  const response = await collection.insertMany(docs, { ...options, session });
  if (logCollection) {
    await logCollection.insertOne(
      {
        args: { docs, options },
        blockId,
        pageId,
        payload,
        requestId,
        response,
        timestamp: new Date(),
        type: 'MongoDBInsertManyConsecutiveIds',
        meta: connection.changeLog?.meta,
      },
      { session }
    );
  }
  return response;
}

async function getIdIndex({ collection, prefix, session }) {
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
  return (previous?.[0]?.index ?? 0) + 1;
}

async function MongoDBInsertManyConsecutiveIds({
  blockId,
  connection,
  pageId,
  request,
  requestId,
  payload,
}) {
  const deserializedRequest = deserialize(request);
  const { docs, options, prefix, length } = deserializedRequest;
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
      const firstId = await getIdIndex({ collection, length, prefix, session });
      for (var [index, doc] of docs.entries()) {
        doc._id = `${prefix}${String(firstId + index).padStart(length, '0')}`;
      }
      response = await insertDocuments({
        blockId,
        collection,
        connection,
        docs,
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
  const { acknowledged, insertedIds } = serialize(response);
  return { acknowledged, insertedIds };
}

MongoDBInsertManyConsecutiveIds.schema = schema;
MongoDBInsertManyConsecutiveIds.meta = {
  checkRead: false,
  checkWrite: true,
};

export default MongoDBInsertManyConsecutiveIds;
