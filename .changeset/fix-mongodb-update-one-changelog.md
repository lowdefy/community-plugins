---
'@lowdefy/community-plugin-mongodb': minor
---

Fix `MongoDBUpdateOne` change-log path. The return shape now matches the non-logged path (`{ acknowledged, matchedCount, modifiedCount, upsertedId, upsertedCount }`) instead of `{ lastErrorObject, ok }`. Audit rows are no longer written for operations that throw `No matching record to update.`. The `after` snapshot is captured atomically via `findOneAndUpdate({ returnDocument: 'after' })`, and the document lookup can no longer collapse to `{ _id: undefined }`. Breaking change for callers that read `lastErrorObject` / `ok` from the logging branch.
