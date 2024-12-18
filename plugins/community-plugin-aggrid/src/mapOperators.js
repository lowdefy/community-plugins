/*
  Copyright 2021 Lowdefy, Inc

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

import { type } from '@lowdefy/helpers';

function recMapOperators(action) {
  if (!type.isObject(action) && !type.isArray(action)) {
    return action;
  }

  if (type.isArray(action)) {
    return action.map((actionObj) => recMapOperators(actionObj));
  }

  const newObject = {};
  const prefix = '$';

  Object.entries(action).forEach(([key, value]) => {
    const newKey = key.replace(new RegExp(`^\\${prefix}+`), (match) => '_'.repeat(match.length));
    newObject[newKey] = recMapOperators(value);
  });

  return newObject;
}

function mapOperators(actions) {
  return recMapOperators(actions);
}

export default mapOperators;
