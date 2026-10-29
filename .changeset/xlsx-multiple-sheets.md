---
'@lowdefy/community-plugin-xlsx': minor
---

`DownloadXlsx` writes files with several sheets. Pass `sheets` with the sheet names, `data` with the rows of each sheet and `schema` with the schema of each sheet, in the same order. Before, `DownloadXlsx` threw `Data should be an array of objects.` for this shape, although `write-excel-file` supports it. A sheet whose rows are empty or missing gets only its header row.
