async function updateDatabaseUser({ adapterUserData, collectionNames, mongoClient }) {
  const { emailVerified: email_verified, id, image } = adapterUserData;
  await mongoClient
    .db()
    .collection(collectionNames.contacts)
    .updateOne({ _id: id }, { $set: { email_verified, image } });
}

export default updateDatabaseUser;
