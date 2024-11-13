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

export default {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Lowdefy Request Schema - MongoDBUpdateInsertOne',
  type: 'object',
  required: ['filter', 'update'],
  properties: {
    filter: {
      type: 'object',
      description: 'The filter used to select the document to find and insert.',
      errorMessage: {
        type: 'MongoDBUpdateInsertOne request property "filter" should be an object.',
      },
    },
    update: {
      type: ['object', 'array'],
      description: 'The update operations to be applied to the new inserted document.',
      errorMessage: {
        type: 'MongoDBUpdateInsertOne request property "update" should be an object.',
      },
    },
    options: {
      type: 'object',
      description: 'Optional settings.',
      errorMessage: {
        type: 'MongoDBUpdateInsertOne request property "options" should be an object.',
      },
    },
  },
  errorMessage: {
    type: 'MongoDBUpdateInsertOne request properties should be an object.',
    required: {
      filter: 'MongoDBUpdateInsertOne request should have required property "filter".',
      update: 'MongoDBUpdateInsertOne request should have required property "update".',
    },
  },
};
