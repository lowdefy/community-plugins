import transformContactToAdapterUser from './transformContactToAdapterUser.js';

async function getUserFromDbById({ appName, db, userId }) {
  const contact = await db.contacts.findOne({ _id: userId });
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

export default getUserFromDbById;
