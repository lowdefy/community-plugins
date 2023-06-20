import { v4 as uuid } from 'uuid';

import transformContactToAdapterUser from './transformContactToAdapterUser.js';

async function createDatabaseUserWithoutContact({ adapterUserData, appName, db, inviteRequired }) {
  if (inviteRequired) {
    throw new Error('Access denied.');
  }
  const { email, emailVerified: email_verified, image = null } = adapterUserData;
  const contact = {
    _id: uuid(),
    email,
    email_verified,
    global_attributes: {},
    image,
    lowercase_email: email.toLowerCase(),
    profile: {},
    disabled: false,
    apps: {
      [appName]: {
        app_attributes: {},
        disabled: false,
        is_user: true,
        roles: [],
        sign_up: new Date(),
      },
    },
  };
  contact.created = { timestamp: new Date(), user: { id: contact._id } };
  contact.updated = { timestamp: new Date(), user: { id: contact._id } };

  await db.contacts.insertOne(contact);
  return transformContactToAdapterUser({ appName, contact });
}

export default createDatabaseUserWithoutContact;
