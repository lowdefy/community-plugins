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

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_INTERVAL = 100;

async function poll(fn, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, interval = DEFAULT_INTERVAL } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await fn();
    if (result.pass) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return await fn();
}

export function createExpect(db, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, interval = DEFAULT_INTERVAL } = options;

  function expectCollection(collectionName) {
    const collection = db.collection(collectionName);

    return {
      async toContainDocument(filter) {
        const result = await poll(
          async () => {
            const doc = await collection.findOne(filter);
            return {
              pass: doc !== null,
              message: doc
                ? `Found document matching filter`
                : `No document found matching filter: ${JSON.stringify(filter)}`,
            };
          },
          { timeout, interval }
        );

        if (!result.pass) {
          throw new Error(result.message);
        }
        return result;
      },

      async toHaveDocumentCount(expectedCount) {
        const result = await poll(
          async () => {
            const count = await collection.countDocuments();
            return {
              pass: count === expectedCount,
              message:
                count === expectedCount
                  ? `Collection has ${expectedCount} documents`
                  : `Expected ${expectedCount} documents, but found ${count}`,
            };
          },
          { timeout, interval }
        );

        if (!result.pass) {
          throw new Error(result.message);
        }
        return result;
      },

      not: {
        async toContainDocument(filter) {
          const result = await poll(
            async () => {
              const doc = await collection.findOne(filter);
              return {
                pass: doc === null,
                message:
                  doc === null
                    ? `No document found matching filter`
                    : `Expected no document matching filter, but found: ${JSON.stringify(doc)}`,
              };
            },
            { timeout, interval }
          );

          if (!result.pass) {
            throw new Error(result.message);
          }
          return result;
        },
      },
    };
  }

  return expectCollection;
}
