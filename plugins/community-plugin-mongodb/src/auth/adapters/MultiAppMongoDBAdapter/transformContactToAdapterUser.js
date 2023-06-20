async function transformContactToAdapterUser({ appName, contact }) {
  const {
    _id: id,
    email,
    email_verified: emailVerified = null,
    global_attributes = {},
    image = null,
    profile = {},
  } = contact;

  const { app_attributes, roles } = contact.apps[appName];

  return {
    id,
    app_attributes,
    email,
    emailVerified,
    image,
    profile,
    roles,
    global_attributes,
  };
}

export default transformContactToAdapterUser;
