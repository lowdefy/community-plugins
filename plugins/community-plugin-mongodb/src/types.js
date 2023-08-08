/* eslint-disable import/namespace */

import * as adapters from './auth/adapters.js';
import * as connections from './connections.js';

export default {
  auth: {
    adapters: Object.keys(adapters),
  },
  connections: Object.keys(connections),
  requests: Object.keys(connections)
    .map((connection) => Object.keys(connections[connection].requests))
    .flat(),
};
