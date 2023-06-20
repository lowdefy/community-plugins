/* eslint-disable import/namespace */

import * as providers from './auth/providers.js';

export default {
  auth: {
    providers: Object.keys(providers),
  },
};
