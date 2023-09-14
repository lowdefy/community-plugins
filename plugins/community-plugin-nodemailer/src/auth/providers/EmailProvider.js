import _emailProvider from 'next-auth/providers/email';

import sendVerificationRequest from './sendVerificationRequest.js';

function EmailProvider(properties) {
  return _emailProvider.default({ ...properties, sendVerificationRequest });
}

export default EmailProvider;
