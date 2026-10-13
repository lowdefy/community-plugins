---
'@lowdefy/community-plugin-xlsx': patch
---

Fix `DownloadXlsx` throwing `Data should be an array of objects.` when `data` is `null` or missing, for example `_request` on a request that returned nothing. Missing data is now treated like an empty array, so the file downloads with only the header row from the schema.
