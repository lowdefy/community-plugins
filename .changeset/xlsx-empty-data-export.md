---
'@lowdefy/community-plugin-xlsx': patch
---

Fix `DownloadXlsx` throwing `Data should be an array of objects.` on an empty `data` array. With a schema, `write-excel-file` emits a header-only file, so a filter matching no rows now downloads instead of erroring.
