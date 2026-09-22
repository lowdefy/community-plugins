# @lowdefy/community-plugin-js

## 1.1.0

### Minor Changes

- a7710e2: Add DataFetch: paginated request fetch that returns the rows

### Patch Changes

- 1401961: Fix `DataDownload` throwing `Cannot read properties of undefined (reading 'keys')` when the paged request returns no rows. With no `fields` param and an empty result, it now downloads an empty CSV instead of crashing.

## 1.0.3

### Patch Changes

- 728e512: Fix package types import config.

## 1.0.2

### Patch Changes

- 0f9bfc3: Update npm publish config

## 1.0.1

### Patch Changes

- 34f881f: Fix Github release workflow.
- 7e96907: chore: Add changesets versioning.
