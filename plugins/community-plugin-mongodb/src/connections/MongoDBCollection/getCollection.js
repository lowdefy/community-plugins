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

import { MongoClient } from 'mongodb';

// A MongoClient owns an internal connection pool and is designed to be created
// once per connection and shared for the lifetime of the process. Creating a
// new client (and connect/close) per request churns server connections and,
// under sustained load, exhausts the server's per-process thread limit.
//
// Cache one connected client per (databaseUri + serialized options). The value
// stored is the connect() promise itself, so concurrent first calls share a
// single connect. If connect() fails the entry is evicted so a later call can
// retry.
const clients = new Map();

function getClientCacheKey({ databaseUri, options }) {
  return `${databaseUri}::${JSON.stringify(options ?? {})}`;
}

function getClient({ databaseUri, options }) {
  const cacheKey = getClientCacheKey({ databaseUri, options });
  let connecting = clients.get(cacheKey);
  if (!connecting) {
    const client = new MongoClient(databaseUri, options);
    connecting = client.connect().catch((error) => {
      clients.delete(cacheKey);
      throw error;
    });
    clients.set(cacheKey, connecting);
  }
  return connecting;
}

// Close every cached client and clear the cache. Intended for graceful
// shutdown and for test teardown; not needed during normal request handling.
async function closeClients() {
  const closing = [];
  for (const connecting of clients.values()) {
    closing.push(
      Promise.resolve(connecting)
        .then((client) => client.close())
        .catch(() => {
          // Ignore errors while closing — we are tearing down anyway.
        })
    );
  }
  clients.clear();
  await Promise.all(closing);
}

async function getCollection({ connection }) {
  const { collection, databaseName, databaseUri, changeLog, options } = connection;
  const client = await getClient({ databaseUri, options });
  const db = client.db(databaseName);
  return {
    client,
    collection: db.collection(collection),
    logCollection: changeLog?.collection && db.collection(changeLog.collection),
  };
}

export { closeClients };
export default getCollection;
