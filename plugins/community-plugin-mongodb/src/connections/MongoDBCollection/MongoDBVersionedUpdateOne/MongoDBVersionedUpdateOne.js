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

async function MongoDBVersionedUpdateOne({
  blockId,
  connection,
  connectionId,
  pageId,
  request,
  requestId,
  payload,
}) {
  const deserializedRequest = deserialize(request);
  const { filter, update, options, disableNoMatchError } = deserializedRequest;
  const { collection, client, logCollection } = await getCollection({ connection });
  const findOptions = options?.find;
  const insertOptions = options?.insert;
  const updateOptions = options?.update;
  let response, insertedDocument;

  try {
    const document = await collection.findOne(filter, { ...findOptions });
    if (logCollection) {
      if (document) {
        delete document._id;
        insertedDocument = await collection.insertOne(document, { ...insertOptions });
      }

      const { value, ...responseWithoutValue } = await collection.findOneAndUpdate(
        insertedDocument ? { _id: insertedDocument.insertedId } : filter,
        update,
        {
          ...updateOptions,
          includeResultMetadata: true,
          returnDocument: 'after',
        }
      );
      response = responseWithoutValue;
      await logCollection.insertOne({
        args: { filter, update, options },
        blockId,
        connectionId,
        pageId,
        payload,
        requestId,
        before: document,
        after: value,
        timestamp: new Date(),
        type: 'MongoDBVersionedUpdateOne',
        meta: connection.changeLog?.meta,
      });
      if (
        !disableNoMatchError &&
        !updateOptions?.upsert &&
        !response.lastErrorObject.updatedExisting
      ) {
        throw new Error('No matching record to update.');
      }
    } else {
      if (document) {
        delete document._id;
        insertedDocument = await collection.insertOne(document, { ...insertOptions });
      }

      response = await collection.updateOne(
        insertedDocument ? { _id: insertedDocument.insertedId } : filter,
        update,
        { ...updateOptions }
      );
      if (!disableNoMatchError && !updateOptions?.upsert && response.matchedCount === 0) {
        throw new Error('No matching record to update.');
      }
    }
  } catch (error) {
    await client.close();
    throw error;
  }
  await client.close();
  return serialize(response);
}

MongoDBVersionedUpdateOne.schema = schema;
MongoDBVersionedUpdateOne.meta = {
  checkRead: false,
  checkWrite: true,
};

export default MongoDBVersionedUpdateOne;
