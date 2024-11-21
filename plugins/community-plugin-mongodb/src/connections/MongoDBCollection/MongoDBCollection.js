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

import { MongoDBCollection } from '@lowdefy/connection-mongodb/connections';

import MongoDBDeleteMany from './MongoDBDeleteMany/MongoDBDeleteMany.js';
import MongoDBDeleteOne from './MongoDBDeleteOne/MongoDBDeleteOne.js';
import MongoDBInsertConsecutiveId from './MongoDBInsertConsecutiveId/MongoDBInsertConsecutiveId.js';
import MongoDBInsertMany from './MongoDBInsertMany/MongoDBInsertMany.js';
import MongoDBInsertManyConsecutiveIds from './MongoDBInsertManyConsecutiveIds/MongoDBInsertManyConsecutiveIds.js';
import MongoDBInsertOne from './MongoDBInsertOne/MongoDBInsertOne.js';
import MongoDBUpdateMany from './MongoDBUpdateMany/MongoDBUpdateMany.js';
import MongoDBUpdateOne from './MongoDBUpdateOne/MongoDBUpdateOne.js';
import MongoDBVersionedUpdateOne from './MongoDBVersionedUpdateOne/MongoDBVersionedUpdateOne.js';
import schema from './schema.js';

const { requests } = MongoDBCollection;

export default {
  schema,
  requests: {
    ...requests,
    MongoDBDeleteMany,
    MongoDBDeleteOne,
    MongoDBInsertConsecutiveId,
    MongoDBInsertMany,
    MongoDBInsertManyConsecutiveIds,
    MongoDBInsertOne,
    MongoDBUpdateMany,
    MongoDBUpdateOne,
    MongoDBVersionedUpdateOne,
  },
};
