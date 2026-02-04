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

Configure your `playwright.config.js`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: '@lowdefy/community-plugin-e2e-mdb/setup',
  globalTeardown: '@lowdefy/community-plugin-e2e-mdb/teardown',
  // ... other config
});
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

  // Assert database state with polling
  await mdb.expect('users').toContainDocument({ name: 'Charlie' });
  await mdb.expect('users').toHaveDocumentCount(3);
});
```

## API Reference

### Fixtures

#### `mdbClient` (worker-scoped)

The raw MongoDB client instance. Shared across tests within a worker.

#### `mdb` (test-scoped)

The main helper object with the following methods:

### `mdb.seed(collectionName, documents)`

Clears the collection and inserts the provided documents.

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

### `mdb.expect(collectionName)`

Returns an assertion object with polling support:

#### `toContainDocument(filter)`

Polls until a document matching the filter is found (or timeout).

```javascript
await mdb.expect('users').toContainDocument({ email: 'new@example.com' });
```

#### `toHaveDocumentCount(n)`

Polls until the collection has exactly n documents.

```javascript
await mdb.expect('orders').toHaveDocumentCount(5);
```

#### `not.toContainDocument(filter)`

Polls until no document matches the filter.

```javascript
await mdb.expect('users').not.toContainDocument({ deleted: true });
```

### `mdb.collection(collectionName)`

Direct access to a MongoDB collection for custom operations.

```javascript
const users = mdb.collection('users');
const count = await users.countDocuments();
```

### `mdb.clearCollection(collectionName)`

Deletes all documents from a collection.

```javascript
await mdb.clearCollection('logs');
```

### `mdb.clearAllCollections()`

Deletes all documents from all collections in the test database.

```javascript
await mdb.clearAllCollections();
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

- `MDB_E2E_URI`: MongoDB connection URI (set automatically by globalSetup)

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
  timeout: 10000,  // Polling timeout in ms
  interval: 200,   // Polling interval in ms
});
```

### Using with Existing MongoDB

If you have an existing MongoDB instance, skip the global setup/teardown and set `MDB_E2E_URI`:

```bash
MDB_E2E_URI=mongodb://localhost:27017 npx playwright test
```

## License

MIT
