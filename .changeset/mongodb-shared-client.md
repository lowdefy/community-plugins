---
'@lowdefy/community-plugin-mongodb': patch
---

Reuse a shared MongoClient per connection URI instead of creating and closing a new client on every request, preventing connection/thread exhaustion under sustained load.
