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

import { validate } from '@lowdefy/ajv';
import MongoDBUpdateInsertOne from './MongoDBUpdateInsertOne.js';
import findLogCollectionRecordTestMongoDb from '../../../test/findLogCollectionRecordTestMongoDb.js';
import populateTestMongoDb from '../../../test/populateTestMongoDb.js';

const { checkRead, checkWrite } = MongoDBUpdateInsertOne.meta;
const schema = MongoDBUpdateInsertOne.schema;

const databaseUri = process.env.MONGO_URL;
const databaseName = 'test';
const collection = 'updateInsertOne';
const logCollection = 'logCollection';
const documents = [{ _id: 'uniqueId', v: 'before', doc_id: 'updateInsertOne' }];

beforeAll(() => {
  return populateTestMongoDb({ collection, documents });
});

test('updateInsertOne', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne' },
    update: { $set: { v: 'after' } },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  const res = await MongoDBUpdateInsertOne({ request, connection });
  expect(res).toEqual({
    acknowledged: true,
    modifiedCount: 1,
    upsertedId: null,
    upsertedCount: 0,
    matchedCount: 1,
  });
});

test('updateInsertOne logCollection', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne' },
    update: { $set: { v: 'afterLog' } },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    changeLog: { collection: logCollection, meta: { meta: true } },
    write: true,
  };
  const res = await MongoDBUpdateInsertOne({
    request,
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'updateInsertOne',
    connection,
  });
  expect(res).toEqual({
    lastErrorObject: {
      n: 1,
      updatedExisting: true,
    },
    ok: 1,
  });
  const logged = await findLogCollectionRecordTestMongoDb({
    logCollection,
    requestId: 'updateInsertOne',
  });
  expect(logged).toMatchObject({
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'updateInsertOne',
    before: { doc_id: 'updateInsertOne', v: 'after' },
    after: { doc_id: 'updateInsertOne', v: 'afterLog' },
    type: 'MongoDBUpdateInsertOne',
    meta: { meta: true },
  });
});

test('updateInsertOne upsert', async () => {
  const request = {
    filter: { _id: 'uniqueId_upsert', doc_id: 'updateInsertOne' },
    update: { $set: { v: 'after' } },
    options: { upsert: true },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  const res = await MongoDBUpdateInsertOne({ request, connection });
  expect(res).toEqual({
    acknowledged: true,
    modifiedCount: 0,
    upsertedId: 'uniqueId_upsert',
    upsertedCount: 1,
    matchedCount: 0,
  });
});

test('updateInsertOne upsert logCollection', async () => {
  const request = {
    filter: { _id: 'uniqueId_upsert_log', doc_id: 'updateInsertOne' },
    update: { $set: { v: 'after' } },
    options: { upsert: true },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    changeLog: { collection: logCollection, meta: { meta: true } },
    write: true,
  };
  const res = await MongoDBUpdateInsertOne({
    request,
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'uniqueId_upsert_log',
    connection,
  });
  expect(res).toEqual({
    lastErrorObject: {
      n: 1,
      updatedExisting: false,
      upserted: 'uniqueId_upsert_log',
    },
    ok: 1,
  });
  const logged = await findLogCollectionRecordTestMongoDb({
    logCollection,
    requestId: 'uniqueId_upsert_log',
  });
  expect(logged).toMatchObject({
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'uniqueId_upsert_log',
    before: null,
    after: { _id: 'uniqueId_upsert_log', v: 'after', doc_id: 'updateInsertOne' },
    type: 'MongoDBUpdateInsertOne',
    meta: { meta: true },
  });
});

test('updateInsertOne upsert false', async () => {
  const request = {
    filter: { doc_id: 'uniqueId_upsert_false' },
    update: { $set: { v: 'after' } },
    options: { upsert: false },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  expect(async () => {
    await MongoDBUpdateInsertOne({ request, connection });
  }).rejects.toThrow('No matching record to update.');
});

test('updateInsertOne upsert false logCollection', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_upsert_false' },
    update: { $set: { v: 'after' } },
    options: { upsert: false },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    changeLog: { collection: logCollection, meta: { meta: true } },
    write: true,
  };
  await expect(async () => {
    await MongoDBUpdateInsertOne({
      request,
      blockId: 'blockId',
      connectionId: 'connectionId',
      pageId: 'pageId',
      payload: { payload: true },
      requestId: 'uniqueId_upsert_false',
      connection,
    });
  }).rejects.toThrow('No matching record to update.');
  const logged = await findLogCollectionRecordTestMongoDb({
    logCollection,
    requestId: 'uniqueId_upsert_false',
  });
  expect(logged).toMatchObject({
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'uniqueId_upsert_false',
    before: null,
    after: null,
    type: 'MongoDBUpdateInsertOne',
    meta: { meta: true },
  });
});

test('updateInsertOne upsert default false', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_upsert_default_false' },
    update: { $set: { v: 'after' } },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  expect(async () => {
    await MongoDBUpdateInsertOne({ request, connection });
  }).rejects.toThrow('No matching record to update.');
});

test('updateInsertOne upsert default false logCollection', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_upsert_default_false' },
    update: { $set: { v: 'after' } },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    changeLog: { collection: logCollection, meta: { meta: true } },
    write: true,
  };
  await expect(async () => {
    await MongoDBUpdateInsertOne({
      request,
      blockId: 'blockId',
      connectionId: 'connectionId',
      pageId: 'pageId',
      payload: { payload: true },
      requestId: 'updateInsertOne_upsert_default_false',
      connection,
    });
  }).rejects.toThrow('No matching record to update.');
  const logged = await findLogCollectionRecordTestMongoDb({
    logCollection,
    requestId: 'updateInsertOne_upsert_default_false',
  });
  expect(logged).toMatchObject({
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'updateInsertOne_upsert_default_false',
    before: null,
    after: null,
    type: 'MongoDBUpdateInsertOne',
    meta: { meta: true },
  });
});

test('updateInsertOne disableNoMatchError', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_disable_no_match_error' },
    update: { $set: { v: 'after' } },
    disableNoMatchError: true,
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  const res = await MongoDBUpdateInsertOne({ request, connection });
  expect(res).toEqual({
    acknowledged: true,
    modifiedCount: 0,
    upsertedId: null,
    upsertedCount: 0,
    matchedCount: 0,
  });
});

test('updateInsertOne disableNoMatchError logCollection', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_disable_no_match_error' },
    update: { $set: { v: 'after' } },
    disableNoMatchError: true,
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    changeLog: { collection: logCollection, meta: { meta: true } },
    write: true,
  };
  const res = await MongoDBUpdateInsertOne({
    request,
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'updateInsertOne_disable_no_match_error',
    connection,
  });
  expect(res).toEqual({
    lastErrorObject: {
      n: 0,
      updatedExisting: false,
    },
    ok: 1,
  });
  const logged = await findLogCollectionRecordTestMongoDb({
    logCollection,
    requestId: 'updateInsertOne_disable_no_match_error',
  });
  expect(logged).toMatchObject({
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'updateInsertOne_disable_no_match_error',
    before: null,
    after: null,
    type: 'MongoDBUpdateInsertOne',
    meta: { meta: true },
  });
});

test('updateInsertOne disableNoMatchError false', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_disable_no_match_error_false' },
    update: { $set: { v: 'after' } },
    disableNoMatchError: false,
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  expect(async () => {
    await MongoDBUpdateInsertOne({ request, connection });
  }).rejects.toThrow('No matching record to update.');
});

test('updateInsertOne disableNoMatchError false logCollection', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_disable_no_match_error_false' },
    update: { $set: { v: 'after' } },
    disableNoMatchError: false,
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    changeLog: { collection: logCollection, meta: { meta: true } },
    write: true,
  };
  await expect(async () => {
    await MongoDBUpdateInsertOne({
      request,
      blockId: 'blockId',
      connectionId: 'connectionId',
      pageId: 'pageId',
      payload: { payload: true },
      requestId: 'updateInsertOne_disable_no_match_error_false',
      connection,
    });
  }).rejects.toThrow('No matching record to update.');
  const logged = await findLogCollectionRecordTestMongoDb({
    logCollection,
    requestId: 'updateInsertOne_disable_no_match_error_false',
  });
  expect(logged).toMatchObject({
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'updateInsertOne_disable_no_match_error_false',
    before: null,
    after: null,
    type: 'MongoDBUpdateInsertOne',
    meta: { meta: true },
  });
});

test('updateInsertOne connection error', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_connection_error' },
    update: { $set: { v: 'after' } },
  };
  const connection = {
    databaseUri: 'bad_uri',
    databaseName,
    collection,
    write: true,
  };
  await expect(MongoDBUpdateInsertOne({ request, connection })).rejects.toThrow(
    'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"'
  );
});

test('updateInsertOne mongodb error', async () => {
  const request = {
    filter: { doc_id: 'updateInsertOne_mongodb_error' },
    update: { $badOp: { v: 'after' } },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  await expect(MongoDBUpdateInsertOne({ request, connection })).rejects.toThrow(
    'Unknown modifier: $badOp'
  );
});

test('checkRead should be false', async () => {
  expect(checkRead).toBe(false);
});

test('checkWrite should be true', async () => {
  expect(checkWrite).toBe(true);
});

test('request not an object', async () => {
  const request = 'request';
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBUpdateInsertOne request properties should be an object.'
  );
});

test('request no filter', async () => {
  const request = { update: {} };
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBUpdateInsertOne request should have required property "filter".'
  );
});

test('request no update', async () => {
  const request = { filter: {} };
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBUpdateInsertOne request should have required property "update".'
  );
});

test('request update not an object', async () => {
  const request = { update: 'update', filter: {} };
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBUpdateInsertOne request property "update" should be an object.'
  );
});

test('request filter not an object', async () => {
  const request = { update: {}, filter: 'filter' };
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBUpdateInsertOne request property "filter" should be an object.'
  );
});

test('request options not an object', async () => {
  const request = { update: {}, filter: {}, options: 'options' };
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBUpdateInsertOne request property "options" should be an object.'
  );
});
