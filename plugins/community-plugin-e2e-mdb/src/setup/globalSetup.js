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
  // Use fixed port for predictable URI (can be set at config time before globalSetup runs)
  // Default to 27117 to avoid conflict with standard MongoDB port 27017
  const port = parseInt(process.env.LOWDEFY_E2E_MONGODB_PORT) || 27117;
  const mongod = await MongoMemoryServer.create({
    instance: { port },
  });
  const uri = mongod.getUri();

  // Store state for teardown and tests
  const state = {
    uri,
    instanceId: mongod.instanceInfo?.instance?.pid,
  };

  fs.writeFileSync(path.join(process.cwd(), STATE_FILE), JSON.stringify(state, null, 2));

  // Store instance globally for teardown
  globalThis.__MONGOD__ = mongod;

  // Set environment variable for tests if not already configured
  // (e.g., with fixed port approach in playwright.config.js that includes a database name)
  if (!process.env.LOWDEFY_E2E_MONGODB_URI) {
    process.env.LOWDEFY_E2E_MONGODB_URI = uri;
  }

  // Set Lowdefy secret env vars so the server resolves to MongoMemoryServer.
  // LOWDEFY_E2E_SECRET_* overrides LOWDEFY_SECRET_* in server-e2e (lowdefy/lowdefy#2058).
  // Both are set for backwards compatibility with older server-e2e versions.
  process.env.LOWDEFY_E2E_SECRET_MONGODB_URI = uri;
  process.env.LOWDEFY_SECRET_MONGODB_URI = uri;

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
