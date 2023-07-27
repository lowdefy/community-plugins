import CredentialsProvider from 'next-auth/providers/credentials';
import createAuthorize from './createAuthorize.js';

function JWTProvider(properties) {
  // next-auth is not exporting correctly for es modules
  // this might break with a next-auth update
  return CredentialsProvider.default({
    id: properties.id ?? 'jwt_provider',
    name: 'JWTProvider',
    credentials: {
      token: { label: 'Token', type: 'text' },
    },
    authorize: createAuthorize(properties),
  });
}

export default JWTProvider;
