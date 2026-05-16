---
'@lowdefy/community-plugin-mongodb': minor
---

Fix the change-log path in `MongoDBDeleteOne` and `MongoDBVersionedUpdateOne`. Both now return the same standard result shape regardless of whether `changeLog` is configured (`MongoDBDeleteOne` → `{ acknowledged, deletedCount }`; `MongoDBVersionedUpdateOne` → `{ acknowledged, matchedCount, modifiedCount, upsertedId, upsertedCount }`) instead of `{ lastErrorObject, ok }`. `MongoDBVersionedUpdateOne` no longer writes audit rows for operations that throw `No matching record to update.`. Breaking change for callers that read `lastErrorObject` / `ok` from the logging branch of either operator.
