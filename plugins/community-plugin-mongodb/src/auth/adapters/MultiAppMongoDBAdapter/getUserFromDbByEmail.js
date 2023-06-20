import transformContactToAdapterUser from './transformContactToAdapterUser.js';

async function getUserFromDbByEmail({ appName, db, email }) {
  const contact = await db.contacts.findOne({ lowercase_email: email.toLowerCase() });
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
