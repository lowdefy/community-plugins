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

async function getCollection({ connection }) {
  let client;
  const { collection, databaseName, databaseUri, changeLog, options } = connection;
  client = new MongoClient(databaseUri, options);
  await client.connect();
  try {
    const db = client.db(databaseName);
    return {
      client,
      collection: db.collection(collection),
      logCollection: changeLog?.collection && db.collection(changeLog.collection),
    };
  } catch (error) {
    await client.close();
    throw error;
  }
}

export default getCollection;
