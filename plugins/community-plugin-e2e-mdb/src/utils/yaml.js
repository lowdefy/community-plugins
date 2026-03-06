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
import YAML from 'yaml';

const dateTag = {
  identify: (value) => value instanceof Date,
  tag: '!date',
  resolve: (str) => new Date(str),
  stringify: (item) => item.value.toISOString(),
};

const customTags = [dateTag];

export function parseYamlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return YAML.parse(content, { customTags });
}

export function writeYamlFile(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const content = YAML.stringify(data, { customTags });
  fs.writeFileSync(filePath, content, 'utf8');
}

export function getYamlFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
    .map((file) => path.join(dirPath, file));
}
