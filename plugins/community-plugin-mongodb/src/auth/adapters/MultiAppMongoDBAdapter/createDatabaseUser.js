import createDatabaseUserFromContact from './createDatabaseUserFromContact.js';
import createDatabaseUserWithoutContact from './createDatabaseUserWithoutContact.js';

async function createDatabaseUser({
  adapterUserData,
  appName,
  collectionNames,
  inviteRequired,
  mongoClient,
}) {
  const contact = await mongoClient.db().collection(collectionNames.contacts).findOne({
    lowercase_email: adapterUserData.email.toLowerCase(),
  });

  if (contact) {
    return createDatabaseUserFromContact({
      adapterUserData,
      appName,
      collectionNames,
      contact,
      inviteRequired,
      mongoClient,
    });
  }

  return createDatabaseUserWithoutContact({
    adapterUserData,
    appName,
    collectionNames,
    inviteRequired,
    mongoClient,
  });
}

export default createDatabaseUser;
