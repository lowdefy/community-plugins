import transformContactToAdapterUser from './transformContactToAdapterUser.js';

async function getUserFromDbById({ appName, collectionNames, mongoClient, userId }) {
  const contact = await mongoClient
    .db()
    .collection(collectionNames.contacts)
    .findOne({ _id: userId });
  if (
    !contact ||
    contact.disabled ||
    contact.removed ||
    !contact.apps?.[appName]?.is_user ||
    contact.apps?.[appName]?.disabled
  ) {
    return null;
  }

  return transformContactToAdapterUser({ appName, contact });
}

export default getUserFromDbById;
