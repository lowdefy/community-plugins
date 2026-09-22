---
'@lowdefy/community-plugin-js': patch
---

Fix `DataDownload` throwing `Cannot read properties of undefined (reading 'keys')` when the paged request returns no rows. With no `fields` param and an empty result, it now downloads an empty CSV instead of crashing.
