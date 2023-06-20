async function updateDatabaseUser({ adapterUserData, db }) {
  const { emailVerified: email_verified, id, image } = adapterUserData;
  await db.contacts.updateOne({ _id: id }, { $set: { email_verified, image } });
}

export default updateDatabaseUser;
