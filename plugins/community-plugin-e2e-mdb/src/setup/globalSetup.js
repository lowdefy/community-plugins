/*
  Copyright 2020-2024 Lowdefy, Inc

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

import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

const STATE_FILE = '.mdb-e2e-state.json';

async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Store state for teardown and tests
  const state = {
    uri,
    instanceId: mongod.instanceInfo?.instance?.pid,
  };

  fs.writeFileSync(
    path.join(process.cwd(), STATE_FILE),
    JSON.stringify(state, null, 2)
  );

  // Store instance globally for teardown
  globalThis.__MONGOD__ = mongod;

  // Set environment variable for tests
  process.env.MDB_E2E_URI = uri;

  return async () => {
    // Cleanup function called by Playwright
    if (globalThis.__MONGOD__) {
      await globalThis.__MONGOD__.stop();
      delete globalThis.__MONGOD__;
    }
    const stateFilePath = path.join(process.cwd(), STATE_FILE);
    if (fs.existsSync(stateFilePath)) {
      fs.unlinkSync(stateFilePath);
    }
  };
}

export default globalSetup;
