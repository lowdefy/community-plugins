# @lowdefy/community-plugin-e2e-mdb

Playwright fixtures for MongoDB e2e testing using `mongodb-memory-server` and YAML snap files.

## Installation

```bash
npm install @lowdefy/community-plugin-e2e-mdb
# or
pnpm add @lowdefy/community-plugin-e2e-mdb
```

## Setup

### Playwright Configuration

Configure your `playwright.config.js`. Call `configureMdb()` **before** `createConfig()` — Playwright starts the webServer before globalSetup, so environment variables must be set at config evaluation time.

```javascript
import configureMdb from '@lowdefy/community-plugin-e2e-mdb/config';
import { createConfig } from '@lowdefy/e2e-utils/config';

// Set MongoDB env vars at config time (before webServer starts)
configureMdb();

const config = createConfig({
  /* ... */
});

export default {
  ...config,
  globalSetup: '@lowdefy/community-plugin-e2e-mdb/setup',
  globalTeardown: '@lowdefy/community-plugin-e2e-mdb/teardown',
};
```

`configureMdb()` accepts optional overrides and returns the URI:

```javascript
const uri = configureMdb({ port: 27200, databaseName: 'my_test_db' });
```

By default, a single-node replica set is started so that MongoDB transactions work (required by `MongoDBInsertConsecutiveId` and other operations). To use a standalone instance instead:

```javascript
configureMdb({ replicaSet: false });
```

### Using the Fixtures

Create a test file that uses the mdb fixtures:

```javascript
import { mdbFixtures as test, expect } from '@lowdefy/community-plugin-e2e-mdb';

test('should insert and find document', async ({ mdb, page }) => {
  // Seed test data
  await mdb.seed('users', [
    { _id: 'user1', name: 'Alice', email: 'alice@example.com' },
    { _id: 'user2', name: 'Bob', email: 'bob@example.com' },
  ]);

  // Perform UI actions that modify the database
  await page.goto('/users');
  await page.click('[data-testid="add-user"]');
  await page.fill('[name="name"]', 'Charlie');
  await page.click('[data-testid="submit"]');

  // Assert database state using native MongoDB driver
  const user = await mdb.collection('users').findOne({ name: 'Charlie' });
  expect(user).toBeDefined();

  const count = await mdb.collection('users').countDocuments();
  expect(count).toBe(3);
});
```

## API Reference

### Fixtures

#### `mdbClient` (worker-scoped)

The raw MongoDB client instance. Shared across tests within a worker.

#### `mdb` (test-scoped)

The main helper object, created fresh for each test. All non-system collections are automatically cleared after each test.

Methods:

### `mdb.seed(collectionName, documents)`

Clears the collection and inserts the provided documents. Returns the native MongoDB collection instance.

```javascript
await mdb.seed('products', [
  { _id: 'p1', name: 'Widget', price: 9.99 },
  { _id: 'p2', name: 'Gadget', price: 19.99 },
]);
```

### `mdb.load(snapName)`

Loads data from YAML snap files into the database.

```javascript
await mdb.load('initial-state');
```

This loads all YAML files from `<testDir>/snaps/initial-state/` into their respective collections.

### `mdb.snap(snapName, collections)`

Saves current database state to YAML snap files.

```javascript
await mdb.snap('after-purchase', ['orders', 'inventory']);
```

### `mdb.collection(collectionName)`

Direct access to a native MongoDB collection for custom operations.

```javascript
const users = mdb.collection('users');
const count = await users.countDocuments();
const user = await users.findOne({ email: 'alice@example.com' });
```

### `mdb.db`

Direct access to the MongoDB database instance.

## Snap File Format

Snap files are YAML files stored in `<testDir>/snaps/<snapName>/<collectionName>.yaml`.

Example structure:

```
tests/
  snaps/
    initial-state/
      users.yaml
      products.yaml
    after-checkout/
      orders.yaml
      inventory.yaml
```

Example YAML file (`users.yaml`):

```yaml
- _id: user1
  name: Alice
  email: alice@example.com
  createdAt: !date 2024-01-15T10:30:00.000Z
- _id: user2
  name: Bob
  email: bob@example.com
  createdAt: !date 2024-01-16T14:45:00.000Z
```

### Date Handling

Use the `!date` tag for Date values:

```yaml
createdAt: !date 2024-01-15T10:30:00.000Z
```

## Environment Variables

- `LOWDEFY_E2E_MONGODB_URI`: MongoDB connection URI (set automatically by globalSetup)
- `LOWDEFY_E2E_MONGODB_PORT`: Port for the in-memory MongoDB server (default: `27117`)
- `LOWDEFY_E2E_SECRET_MONGODB_URI`: Set automatically by globalSetup. Overrides `LOWDEFY_SECRET_MONGODB_URI` in server-e2e so the MongoMemoryServer URI survives secret-manager injection via `commandPrefix`.
- `LOWDEFY_SECRET_MONGODB_URI`: Set automatically by globalSetup for backwards compatibility with server-e2e versions that don't support `LOWDEFY_E2E_SECRET_*`.

### Overriding Secrets in E2E Tests

When using a secret manager (e.g. Infisical, Doppler) via `commandPrefix` in your Lowdefy e2e config, the secret manager injects `LOWDEFY_SECRET_*` env vars that can override values set by test infrastructure. The `LOWDEFY_E2E_SECRET_*` prefix (supported in server-e2e via [lowdefy/lowdefy#2058](https://github.com/lowdefy/lowdefy/issues/2058)) takes precedence over `LOWDEFY_SECRET_*` during secret resolution, ensuring test-infrastructure values win.

This plugin sets `LOWDEFY_E2E_SECRET_MONGODB_URI` automatically. To override other secrets in your tests, set additional `LOWDEFY_E2E_SECRET_*` env vars in your `playwright.config.js`:

```javascript
export default defineConfig({
  use: {
    // Override any secret that would otherwise come from the secret manager
    env: {
      LOWDEFY_E2E_SECRET_MY_API_KEY: 'test-api-key',
    },
  },
});
```

## Advanced Usage

### Custom Helper Configuration

For advanced setups, you can create the helper manually:

```javascript
import { createMdbHelper } from '@lowdefy/community-plugin-e2e-mdb';
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('test');

const mdb = createMdbHelper(db, {
  baseDir: './tests',
});
```

### Using with Existing MongoDB

If you have an existing MongoDB instance, skip the global setup/teardown and set `LOWDEFY_E2E_MONGODB_URI`:

```bash
LOWDEFY_E2E_MONGODB_URI=mongodb://localhost:27017 npx playwright test
```

## License

MIT
