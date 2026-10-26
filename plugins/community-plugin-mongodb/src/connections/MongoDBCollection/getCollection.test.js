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

import { jest } from '@jest/globals';

// Tracks every MongoClient the module under test constructs, and lets each
// test steer what connect() does.
const instances = [];
let connectImpl = (client) => Promise.resolve(client);

jest.unstable_mockModule('mongodb', () => ({
  MongoClient: class MongoClient {
    constructor(uri, options) {
      this.uri = uri;
      this.options = options;
      this.connect = jest.fn(() => connectImpl(this));
      this.db = jest.fn(() => ({ collection: jest.fn((name) => ({ name })) }));
      this.close = jest.fn(async () => {});
      instances.push(this);
    }
  },
}));

let getCollection;
let closeClients;

beforeAll(async () => {
  ({ default: getCollection, closeClients } = await import('./getCollection.js'));
});

beforeEach(async () => {
  await closeClients();
  instances.length = 0;
  connectImpl = (client) => Promise.resolve(client);
});

const baseConnection = {
  databaseUri: 'mongodb://localhost:27017',
  databaseName: 'test',
  collection: 'things',
};

test('reuses a single client for the same uri and options', async () => {
  const connection = { ...baseConnection, options: { maxPoolSize: 10 } };
  const first = await getCollection({ connection });
  const second = await getCollection({ connection });

  expect(first.client).toBe(second.client);
  expect(instances).toHaveLength(1);
  expect(instances[0].connect).toHaveBeenCalledTimes(1);
});

test('concurrent first calls share a single connect', async () => {
  let resolveConnect;
  connectImpl = (client) =>
    new Promise((resolve) => {
      resolveConnect = () => resolve(client);
    });
  const connection = { ...baseConnection, options: { maxPoolSize: 10 } };

  const pending = Promise.all([getCollection({ connection }), getCollection({ connection })]);
  resolveConnect();
  const [first, second] = await pending;

  expect(first.client).toBe(second.client);
  expect(instances).toHaveLength(1);
  expect(instances[0].connect).toHaveBeenCalledTimes(1);
});

test('creates separate clients for different options', async () => {
  const first = await getCollection({
    connection: { ...baseConnection, options: { maxPoolSize: 10 } },
  });
  const second = await getCollection({
    connection: { ...baseConnection, options: { maxPoolSize: 20 } },
  });

  expect(first.client).not.toBe(second.client);
  expect(instances).toHaveLength(2);
});

test('evicts a failed connect so the next call retries', async () => {
  let attempt = 0;
  connectImpl = (client) => {
    attempt += 1;
    if (attempt === 1) {
      return Promise.reject(new Error('connect failed'));
    }
    return Promise.resolve(client);
  };
  const connection = { ...baseConnection, options: { maxPoolSize: 10 } };

  await expect(getCollection({ connection })).rejects.toThrow('connect failed');
  const retried = await getCollection({ connection });

  expect(retried.client).toBeDefined();
  expect(instances).toHaveLength(2);
});
