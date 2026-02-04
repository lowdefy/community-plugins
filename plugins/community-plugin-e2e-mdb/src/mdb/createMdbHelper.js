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

import { load, snap } from './snap.js';
import { seed } from './seed.js';
import { createExpect } from './expect.js';
import { createCollectionWrapper } from './collection.js';

export function createMdbHelper(db, options = {}) {
  const {
    baseDir = process.cwd(),
    timeout = 5000,
    interval = 100,
  } = options;

  const expectOptions = { timeout, interval };
  const snapOptions = { baseDir };

  return {
    db,

    collection: createCollectionWrapper(db),

    async load(snapName) {
      await load(db, snapName, snapOptions);
    },

    async snap(snapName, collections) {
      await snap(db, snapName, collections, snapOptions);
    },

    async seed(collectionName, documents) {
      return seed(db, collectionName, documents);
    },

    expect: createExpect(db, expectOptions),

    async clearCollection(collectionName) {
      const collection = db.collection(collectionName);
      await collection.deleteMany({});
    },

    async clearAllCollections() {
      const collections = await db.listCollections().toArray();
      for (const { name } of collections) {
        await db.collection(name).deleteMany({});
      }
    },
  };
}
