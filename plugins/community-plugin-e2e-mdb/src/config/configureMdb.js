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

/**
 * Configure MongoDB e2e environment variables at config evaluation time.
 *
 * Call this in playwright.config.js BEFORE createConfig() — Playwright starts
 * the webServer before globalSetup, so env vars must be set at config time
 * for the server process to inherit them.
 *
 * globalSetup then starts MongoMemoryServer on the configured port.
 *
 * By default, a single-node replica set is used so that transactions
 * (required by MongoDBInsertConsecutiveId and other operations) work.
 * Pass `replicaSet: false` to use a standalone instance instead.
 *
 * @param {Object} [options]
 * @param {number} [options.port=27117] - Port for MongoMemoryServer
 * @param {string} [options.databaseName='e2e_test'] - Database name
 * @param {string|false} [options.replicaSet='testset'] - Replica set name, or false for standalone
 * @returns {string} The MongoDB URI
 */
function configureMdb({ port, databaseName, replicaSet = 'testset' } = {}) {
  const mdbPort = port || parseInt(process.env.LOWDEFY_E2E_MONGODB_PORT) || 27117;
  const dbName = databaseName || 'e2e_test';

  let uri;
  if (replicaSet) {
    uri = `mongodb://127.0.0.1:${mdbPort}/${dbName}?replicaSet=${replicaSet}`;
  } else {
    uri = `mongodb://127.0.0.1:${mdbPort}/${dbName}`;
  }

  // Set the URI for the mdb plugin fixtures and globalSetup
  process.env.LOWDEFY_E2E_MONGODB_URI = uri;
  process.env.LOWDEFY_E2E_MONGODB_PORT = String(mdbPort);

  // Set Lowdefy secret overrides so the server connects to MongoMemoryServer.
  // LOWDEFY_E2E_SECRET_* takes precedence over LOWDEFY_SECRET_* in server-e2e.
  // Both are set for backwards compatibility.
  process.env.LOWDEFY_E2E_SECRET_MONGODB_URI = uri;
  process.env.LOWDEFY_SECRET_MONGODB_URI = uri;

  return uri;
}

export default configureMdb;
