import transformContactToAdapterUser from './transformContactToAdapterUser.js';

async function createDatabaseUserFromContact({
  adapterUserData,
  appName,
  contact,
  db,
  inviteRequired,
}) {
  const invite = contact.apps?.[appName]?.invite;
  if (inviteRequired && (!invite || !invite.open)) {
    throw new Error('Access denied.');
  }

  if (contact.disabled || contact.apps?.[appName]?.disabled) {
    throw new Error('Access denied.');
  }

  const { emailVerified: email_verified, image } = adapterUserData;

  const update = {
    email_verified,
    image,
    updated: { timestamp: new Date(), user: { id: contact._id } },
  };

  if (contact.apps?.[appName]) {
    update[`apps.${appName}.disabled`] = false;
    update[`apps.${appName}.is_user`] = true;
    update[`apps.${appName}.sign_up`] = new Date();

    if (invite) {
      update[`apps.${appName}.invite.open`] = false;
    }
  } else {
    update[`apps.${appName}`] = {
      app_attributes: {},
      disabled: false,
      is_user: true,
      roles: [],
      sign_up: new Date(),
    };
  }

  const { value: updatedContact } = await db.contacts.findOneAndUpdate(
    { _id: contact._id },
    { $set: update },
    { returnDocument: 'after' }
  );
  return transformContactToAdapterUser({ appName, contact: updatedContact });
}

export default createDatabaseUserFromContact;
