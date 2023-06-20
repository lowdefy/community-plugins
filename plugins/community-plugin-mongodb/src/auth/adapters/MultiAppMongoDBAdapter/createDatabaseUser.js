import createDatabaseUserFromContact from './createDatabaseUserFromContact.js';
import createDatabaseUserWithoutContact from './createDatabaseUserWithoutContact.js';

async function createDatabaseUser({ adapterUserData, appName, db, inviteRequired }) {
  const contact = await db.contacts.findOne({
    lowercase_email: adapterUserData.email.toLowerCase(),
  });

  if (contact) {
    return createDatabaseUserFromContact({ adapterUserData, appName, contact, db, inviteRequired });
  }

  return createDatabaseUserWithoutContact({
    adapterUserData,
    appName,
    db,
    inviteRequired,
  });
}

export default createDatabaseUser;
