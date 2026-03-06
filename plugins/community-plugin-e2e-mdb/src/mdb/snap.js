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

import fs from 'fs';
import path from 'path';
import { parseYamlFile, writeYamlFile, getYamlFiles } from '../utils/yaml.js';
import { getSnapDir, getCollectionPath } from '../utils/paths.js';

export async function load(db, snapName, options = {}) {
  const { baseDir = process.cwd() } = options;
  const snapDir = getSnapDir(baseDir, snapName);

  if (!fs.existsSync(snapDir)) {
    throw new Error(`Snap directory not found: ${snapDir}`);
  }

  const yamlFiles = getYamlFiles(snapDir);

  for (const filePath of yamlFiles) {
    const collectionName = path.basename(filePath, path.extname(filePath));
    const documents = parseYamlFile(filePath);

    if (Array.isArray(documents) && documents.length > 0) {
      const collection = db.collection(collectionName);
      await collection.deleteMany({});
      await collection.insertMany(documents);
    }
  }
}

export async function snap(db, snapName, collections, options = {}) {
  const { baseDir = process.cwd() } = options;
  const snapDir = getSnapDir(baseDir, snapName);

  if (!fs.existsSync(snapDir)) {
    fs.mkdirSync(snapDir, { recursive: true });
  }

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    const filePath = getCollectionPath(snapDir, collectionName);
    writeYamlFile(filePath, documents);
  }
}
