import { MongoClient } from 'mongodb';

import createDatabaseUser from './createDatabaseUser.js';
import getUserFromDbByEmail from './getUserFromDbByEmail.js';
import getUserFromDbById from './getUserFromDbById.js';
import updateDatabaseUser from './updateDatabaseUser.js';

function from({ _id, ...data }) {
  return { id: _id, ...data };
}

function to({ id, ...data }) {
  return { _id: id, ...data };
}

function MultipleAppMongoDBAdapter({ properties }) {
  const { appName, databaseUri, mongoDBClientOptions } = properties;
  const dbPromise = (async () => {
    const _db = (await new MongoClient(databaseUri, mongoDBClientOptions).connect()).db();
    return {
      accounts: _db.collection('user_accounts'),
      contacts: _db.collection('user_contacts'),
      sessions: _db.collection('user_sessions'),
      verificationTokens: _db.collection('user_verification_tokens'),
    };
  })();

  return {
    async createUser(adapterUserData) {
      const db = await dbPromise;
      return createDatabaseUser({
        adapterUserData,
        appName,
        db,
        inviteRequired: properties.invite?.required,
      });
    },

    async getUser(userId) {
      const db = await dbPromise;
      return getUserFromDbById({ appName, db, userId });
    },

    async getUserByEmail(email) {
      const db = await dbPromise;
      return getUserFromDbByEmail({ appName, db, email });
    },

    async getUserByAccount(provider_providerAccountId) {
      const db = await dbPromise;
      const account = await db.accounts.findOne(provider_providerAccountId);
      if (!account) return null;

      return getUserFromDbById({ appName, db, userId: account.userId });
    },

    async updateUser(adapterUserData) {
      const db = await dbPromise;
      await updateDatabaseUser({ adapterUserData, db });
      return adapterUserData;
    },

    // This is not yet implemented by Auth.js
    // and we want to set a disabled flag, not delete users
    // async deleteUser(userId) {
    //   console.log('deleteUser', userId);
    //   const db = await dbPromise;

    //   await Promise.all([
    //     db.accounts.deleteMany({ userId }),
    //     db.sessions.deleteMany({ userId }),
    //     deleteDatabaseUser({ userId }),
    //   ]);
    // },

    async linkAccount(account) {
      await (await dbPromise).accounts.insertOne(to(account));
      return from(account);
    },

    async unlinkAccount(provider_providerAccountId) {
      const { value: account } = await (
        await dbPromise
      ).accounts.findOneAndDelete(provider_providerAccountId);
      return from(account);
    },

    async getSessionAndUser(sessionToken) {
      const db = await dbPromise;

      // eslint-disable-next-line no-unused-vars
      const session = await db.sessions.findOne({ sessionToken });
      if (!session) return null;

      const user = await getUserFromDbById({ appName, db, userId: session.userId });

      return {
        user,
        session: from(session),
      };
    },

    async createSession(session) {
      await (await dbPromise).sessions.insertOne(to(session));
      return session;
    },

    async updateSession(data) {
      // eslint-disable-next-line no-unused-vars
      const { _id, ...session } = to(data);

      const result = await (
        await dbPromise
      ).sessions.findOneAndUpdate(
        { sessionToken: session.sessionToken },
        { $set: session },
        { returnDocument: 'after' }
      );
      return from(result.value);
    },

    async deleteSession(sessionToken) {
      const { value: session } = await (
        await dbPromise
      ).sessions.findOneAndDelete({
        sessionToken,
      });
      return from(session);
    },

    async createVerificationToken(data) {
      await (await dbPromise).verificationTokens.insertOne(to(data));
      return data;
    },

    async useVerificationToken(identifier_token) {
      const { value: verificationToken } = await (
        await dbPromise
      ).verificationTokens.findOneAndDelete(identifier_token);

      if (!verificationToken) return null;
      return from(verificationToken);
    },
  };
}

export default MultipleAppMongoDBAdapter;
