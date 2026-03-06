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

import { test as base } from '@playwright/test';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { createMdbHelper } from '../mdb/createMdbHelper.js';

const STATE_FILE = '.mdb-e2e-state.json';

function getMongoUri() {
  // First check environment variable
  if (process.env.MDB_E2E_URI) {
    return process.env.MDB_E2E_URI;
  }

  // Fallback to state file
  const stateFilePath = path.join(process.cwd(), STATE_FILE);
  if (fs.existsSync(stateFilePath)) {
    const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
    return state.uri;
  }

  throw new Error(
    'MongoDB URI not found. Ensure globalSetup is configured in playwright.config.js'
  );
}

function getDatabaseFromUri(uri) {
  try {
    const url = new URL(uri);
    const dbName = url.pathname.slice(1);
    return dbName || 'test';
  } catch {
    return 'test';
  }
}

export const mdbFixtures = base.extend({
  // Worker-scoped MongoDB client (shared across tests in a worker)
  mdbClient: [
    async ({}, use) => {
      const uri = getMongoUri();
      const client = new MongoClient(uri);
      await client.connect();

      await use(client);

      await client.close();
    },
    { scope: 'worker' },
  ],

  // Test-scoped mdb helper with automatic cleanup
  mdb: async ({ mdbClient }, use, testInfo) => {
    const uri = getMongoUri();
    const dbName = getDatabaseFromUri(uri);
    const db = mdbClient.db(dbName);

    const options = {
      baseDir: testInfo.project.testDir || process.cwd(),
    };

    const mdb = createMdbHelper(db, options);

    await use(mdb);

    // Cleanup: clear all collections used during the test
    const collections = await db.listCollections().toArray();
    for (const { name } of collections) {
      if (!name.startsWith('system.')) {
        await db.collection(name).deleteMany({});
      }
    }
  },
});

export { expect } from '@playwright/test';
