import jwt from 'jsonwebtoken';

function createAuthorize({ algorithms, audience, issuer, maxAge, secret }) {
  if (!audience) {
    throw new Error('Configuration error: JWTProvider audience property is not configured.');
  }

  async function authorize({ token }) {
    try {
      const decoded = jwt.verify(token, secret, {
        algorithms: algorithms ?? ['HS256'],
        audience,
        issuer,
        maxAge: maxAge ?? '2m',
      });
      return {
        ...decoded,
        jwt_user: true,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  return authorize;
}

export default createAuthorize;
