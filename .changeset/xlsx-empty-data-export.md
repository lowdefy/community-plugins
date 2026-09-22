---
'@lowdefy/community-plugin-xlsx': patch
---

Fix `DownloadXlsx` throwing `Data should be an array of objects.` on an empty `data` array. `write-excel-file` accepts an empty `data` array, so a filter matching no rows now downloads (a header row when the schema defines column titles, otherwise an empty sheet) instead of erroring. The data guard now also validates every element rather than only the first, so a malformed row raises `DownloadXlsx`'s own error instead of a confusing failure inside `write-excel-file`.
