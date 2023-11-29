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

async function MongodbUpdateOne({
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
  let response;
  try {
    if (logCollection) {
      const { value, ...responseWithoutValue } = await collection.findOneAndUpdate(filter, update, {
        ...options,
        includeResultMetadata: true,
      });
      response = responseWithoutValue;
      const after = await collection.findOne({
        _id: value ? value._id : response.lastErrorObject?.upserted,
      });
      await logCollection.insertOne({
        args: { filter, update, options },
        blockId,
        connectionId,
        pageId,
        payload,
        requestId,
        before: value,
        after,
        timestamp: new Date(),
        type: 'MongoDBUpdateOne',
        meta: connection.changeLog?.meta,
      });
      if (!disableNoMatchError && !response.lastErrorObject.updatedExisting) {
        throw new Error('No matching record to update.');
      }
    } else {
      response = await collection.updateOne(filter, update, options);
      if (!disableNoMatchError && response.matchedCount === 0) {
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

MongodbUpdateOne.schema = schema;
MongodbUpdateOne.meta = {
  checkRead: false,
  checkWrite: true,
};

export default MongodbUpdateOne;
