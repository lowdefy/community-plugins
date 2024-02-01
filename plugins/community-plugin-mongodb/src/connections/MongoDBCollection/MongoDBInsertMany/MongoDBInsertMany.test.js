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
import MongoDBInsertMany from './MongoDBInsertMany.js';
import clearTestMongoDb from '../../../test/clearTestMongoDb.js';
import findLogCollectionRecordTestMongoDb from '../../../test/findLogCollectionRecordTestMongoDb.js';

const { checkRead, checkWrite } = MongoDBInsertMany.meta;
const schema = MongoDBInsertMany.schema;

const databaseUri = process.env.MONGO_URL;
const databaseName = 'test';
const collection = 'insertMany';
const logCollection = 'logCollection';

beforeAll(() => {
  return clearTestMongoDb({ collection });
});

test('insertMany', async () => {
  const request = {
    docs: [{ _id: 'insertMany1-1' }, { _id: 'insertMany1-2' }, { _id: 'insertMany1-3' }],
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  const res = await MongoDBInsertMany({ request, connection });
  expect(res).toEqual({
    acknowledged: true,
    insertedCount: 3,
    insertedIds: { 0: 'insertMany1-1', 1: 'insertMany1-2', 2: 'insertMany1-3' },
  });
});

test('insertMany logCollection', async () => {
  const request = {
    docs: [
      { _id: 'insertMany1-1_log' },
      { _id: 'insertMany1-2_log' },
      { _id: 'insertMany1-3_log' },
    ],
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    changeLog: { collection: logCollection, meta: { meta: true } },
    write: true,
  };
  const res = await MongoDBInsertMany({
    request,
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'insertMany_log',
    connection,
  });
  expect(res).toEqual({
    acknowledged: true,
    insertedCount: 3,
    insertedIds: { 0: 'insertMany1-1_log', 1: 'insertMany1-2_log', 2: 'insertMany1-3_log' },
  });
  const logged = await findLogCollectionRecordTestMongoDb({
    logCollection,
    requestId: 'insertMany_log',
  });
  expect(logged).toMatchObject({
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'insertMany_log',
    type: 'MongoDBInsertMany',
    meta: { meta: true },
  });
});

test('insertMany options', async () => {
  const request = {
    docs: [{ _id: 'insertMany2-1' }, { _id: 'insertMany2-2' }],
    options: { writeConcern: { w: 'majority' } },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  const res = await MongoDBInsertMany({ request, connection });
  expect(res).toEqual({
    acknowledged: true,
    insertedCount: 2,
    insertedIds: { 0: 'insertMany2-1', 1: 'insertMany2-2' },
  });
});

test('insertMany logCollection options', async () => {
  const request = {
    docs: [{ _id: 'insertMany2-1_log' }, { _id: 'insertMany2-2_log' }],
    options: { writeConcern: { w: 'majority' } },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    changeLog: { collection: logCollection, meta: { meta: true } },
    write: true,
  };
  const res = await MongoDBInsertMany({
    request,
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'insertMany_options_log',
    connection,
  });
  expect(res).toEqual({
    acknowledged: true,
    insertedCount: 2,
    insertedIds: { 0: 'insertMany2-1_log', 1: 'insertMany2-2_log' },
  });
  const logged = await findLogCollectionRecordTestMongoDb({
    logCollection,
    requestId: 'insertMany_options_log',
  });
  expect(logged).toMatchObject({
    blockId: 'blockId',
    connectionId: 'connectionId',
    pageId: 'pageId',
    payload: { payload: true },
    requestId: 'insertMany_options_log',
    type: 'MongoDBInsertMany',
    meta: { meta: true },
  });
});

test('insertMany connection error', async () => {
  const request = { docs: [{ _id: 'insertMany8-1' }, { _id: 'insertMany8-2' }] };
  const connection = {
    databaseUri: 'bad_uri',
    databaseName,
    collection,
    write: true,
  };
  await expect(MongoDBInsertMany({ request, connection })).rejects.toThrow(
    'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"'
  );
});

test('insertMany mongodb error', async () => {
  const request = { docs: [{ _id: 'insertMany9-1' }, { _id: 'insertMany9-2' }] };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  await MongoDBInsertMany({ request, connection });
  await expect(MongoDBInsertMany({ request, connection })).rejects.toThrow(
    'E11000 duplicate key error'
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
    'MongoDBInsertMany request properties should be an object.'
  );
});

test('request no docs', async () => {
  const request = {};
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBInsertMany request should have required property "docs".'
  );
});

test('request docs not an array', async () => {
  const request = { docs: 'docs' };
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBInsertMany request property "docs" should be an array.'
  );
});

test('request docs not an array of objects', async () => {
  const request = { docs: [1, 2, 3] };
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBInsertMany request property "docs" should be an array of documents to insert.'
  );
});

test('request options not an object', async () => {
  const request = { docs: [], options: 'options' };
  expect(() => validate({ schema, data: request })).toThrow(
    'MongoDBInsertMany request property "options" should be an object.'
  );
});
