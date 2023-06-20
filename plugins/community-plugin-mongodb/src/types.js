/* eslint-disable import/namespace */

import * as adapters from './auth/adapters.js';

export default {
  auth: {
    adapters: Object.keys(adapters),
  },
};
