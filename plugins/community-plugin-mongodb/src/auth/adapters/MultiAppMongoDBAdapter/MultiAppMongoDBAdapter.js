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

function MultiAppMongoDBAdapter({ properties }) {
  const { appName, collections, databaseUri, mongoDBClientOptions } = properties;
  const mongoClient = new MongoClient(databaseUri, mongoDBClientOptions);
  const collectionNames = {
    accounts: collections?.accounts ?? 'user_accounts',
    contacts: collections?.contacts ?? 'user_contacts',
    sessions: collections?.sessions ?? 'user_sessions',
    verificationTokens: collections?.verificationTokens ?? 'user_verification_tokens',
  };

  return {
    async createUser(adapterUserData) {
      return createDatabaseUser({
        adapterUserData,
        appName,
        collectionNames,
        inviteRequired: properties.invite?.required,
        mongoClient,
      });
    },

    async getUser(userId) {
      return getUserFromDbById({ appName, collectionNames, mongoClient, userId });
    },

    async getUserByEmail(email) {
      return getUserFromDbByEmail({ appName, collectionNames, mongoClient, email });
    },

    async getUserByAccount(provider_providerAccountId) {
      const account = await mongoClient
        .db()
        .collection(collectionNames.accounts)
        .findOne(provider_providerAccountId);
      if (!account) return null;

      return getUserFromDbById({ appName, collectionNames, mongoClient, userId: account.userId });
    },

    async updateUser(adapterUserData) {
      await updateDatabaseUser({ adapterUserData, collectionNames, mongoClient });
      return adapterUserData;
    },

    // This is not yet implemented by Auth.js
    // and we want to set a disabled flag, not delete users
    // async deleteUser(userId) {
    //   await Promise.all([
    //     db.accounts.deleteMany({ userId }),
    //     db.sessions.deleteMany({ userId }),
    //     deleteDatabaseUser({ userId }),
    //   ]);
    // },

    async linkAccount(account) {
      await mongoClient.db().collection(collectionNames.accounts).insertOne(to(account));
      return from(account);
    },

    async unlinkAccount(provider_providerAccountId) {
      const account = await mongoClient
        .db()
        .collection(collectionNames.accounts)
        .findOneAndDelete(provider_providerAccountId);
      return from(account);
    },

    async getSessionAndUser(sessionToken) {
      // eslint-disable-next-line no-unused-vars
      const session = await mongoClient
        .db()
        .collection(collectionNames.sessions)
        .findOne({ sessionToken });
      if (!session) return null;

      const user = await getUserFromDbById({
        appName,
        collectionNames,
        mongoClient,
        userId: session.userId,
      });

      return {
        user,
        session: from(session),
      };
    },

    async createSession(session) {
      await mongoClient.db().collection(collectionNames.sessions).insertOne(to(session));
      return session;
    },

    async updateSession(data) {
      // eslint-disable-next-line no-unused-vars
      const { _id, ...session } = to(data);

      const result = await mongoClient
        .db()
        .collection(collectionNames.sessions)
        .findOneAndUpdate(
          { sessionToken: session.sessionToken },
          { $set: session },
          { returnDocument: 'after' }
        );
      return from(result);
    },

    async deleteSession(sessionToken) {
      const session = await mongoClient.db().collection(collectionNames.sessions).findOneAndDelete({
        sessionToken,
      });
      return from(session);
    },

    async createVerificationToken(data) {
      await mongoClient.db().collection(collectionNames.verificationTokens).insertOne(to(data));
      return data;
    },

    async useVerificationToken(identifier_token) {
      const verificationToken = await mongoClient
        .db()
        .collection(collectionNames.verificationTokens)
        .findOneAndDelete(identifier_token);

      if (!verificationToken) return null;
      return from(verificationToken);
    },
  };
}

export default MultiAppMongoDBAdapter;
