---
'@lowdefy/community-plugin-mongodb': major
---

The `MongoDBUpdateOne` request now throws an error if no document was matched and updated. This behaviour can be disabled by setting the new `disableNoMatchError` property.

