# @lowdefy/community-plugin-mongodb

## 2.4.1

### Patch Changes

- 39cb4ea: Fix MongoDBVersionedUpdateOne request was not included in connection.

## 2.4.0

### Minor Changes

- 6c001b7: Added MongoDBVersionedUpdateOne request.

## 2.3.0

### Minor Changes

- dd8f667: Add support for a removed field on the user object.

## 2.2.1

### Patch Changes

- 1f3de71: Fixed issue where user login fails for an invited user on first signup.

## 2.2.0

### Minor Changes

- 5fc778b: Update MongoDBInsertMany to return insertedIds.

## 2.1.0

### Minor Changes

- c6db5d5: Add a property (verificationTokens.uses) to MultiAppMongoDBAdapter to customise how many times a verification can be used.

## 2.0.1

### Patch Changes

- b864c10: Fix MultiAppMongoDBAdapter for mongodb v6 driver.

## 2.0.0

### Major Changes

- a3a3b2c: The `MongoDBUpdateOne` request now throws an error if no document was matched and updated. This behaviour can be disabled by setting the new `disableNoMatchError` property.

### Patch Changes

- 0ed171e: Update dependency mongodb to v6.3.0.
- 4c3ad0c: Handle upsert true for error throw.

## 1.4.1

### Patch Changes

- 83f476f: Add connectionId to log-changes logs.
  Fix: Request plugins were not exported as part of package.

## 1.4.0

### Minor Changes

- 11ccb31: Add option to configure MultiAppMongoDBAdapter collection names.

### Patch Changes

- 40ad8b2: Unpin next-auth dependency.
- 55e37da: Unpin uuid dependency.
- 11ccb31: Fix connection timeouts in MultiAppMongoDBAdapter.

## 1.3.1

### Patch Changes

- 72d39d5: Do not pin Lowdefy utility dependencies to a fixed version.

## 1.3.0

### Minor Changes

- afe6915: Add mongodb change log requests.

## 1.2.1

### Patch Changes

- 39d35e0: Fixed MongoDBInsertManyConsecutiveIds request response.

## 1.2.0

### Minor Changes

- ee14311: Added the MongoDBInsertManyConsecutiveIds request.

## 1.1.0

### Minor Changes

- d90c399: Rexported @lowdefy/connection-mongodb plugins as part of this package.
- d90c399: Added MongoDBInsertConsecutiveId request.

## 1.0.3

### Patch Changes

- 728e512: Fix package types import config.

## 1.0.2

### Patch Changes

- f31c3db: Fix plugin configuration files.

## 1.0.1

### Patch Changes

- 0f9bfc3: Update npm publish config
