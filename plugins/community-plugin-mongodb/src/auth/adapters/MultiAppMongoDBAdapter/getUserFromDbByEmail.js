import transformContactToAdapterUser from './transformContactToAdapterUser.js';

async function getUserFromDbByEmail({ appName, collectionNames, email, mongoClient }) {
  const contact = await mongoClient
    .db()
    .collection(collectionNames.contacts)
    .findOne({ lowercase_email: email.toLowerCase() });
  if (
    !contact ||
    contact.disabled ||
    !contact.apps?.[appName]?.is_user ||
    contact.apps?.[appName]?.disabled
  ) {
    return null;
  }

  return transformContactToAdapterUser({ appName, contact });
}

export default getUserFromDbByEmail;
