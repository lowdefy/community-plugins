# @lowdefy/community-plugin-xlsx

## 1.2.0

### Minor Changes

- 6e9af2d: `DownloadXlsx` writes files with several sheets. Pass `sheets` with the sheet names, `data` with the rows of each sheet and `schema` with the schema of each sheet, in the same order. Before, `DownloadXlsx` threw `Data should be an array of objects.` for this shape, although `write-excel-file` supports it. A sheet whose rows are empty or missing gets only its header row.

## 1.1.2

### Patch Changes

- 73b60b4: Fix `DownloadXlsx` throwing `Data should be an array of objects.` when `data` is `null` or missing, for example `_request` on a request that returned nothing. Missing data is now treated like an empty array, so the file downloads with only the header row from the schema.

## 1.1.1

### Patch Changes

- 4558cb2: Fix `DownloadXlsx` throwing `Data should be an array of objects.` on an empty `data` array. `write-excel-file` accepts an empty `data` array, so a filter matching no rows now downloads (a header row when the schema defines column titles, otherwise an empty sheet) instead of erroring. The data guard now also validates every element rather than only the first, so a malformed row raises `DownloadXlsx`'s own error instead of a confusing failure inside `write-excel-file`.

## 1.1.0

### Minor Changes

- f4e0096: - Added functionality for dot-notation in the value field.
  - Added functionality for Array types.
  - Added error if schema param is not defined.
  - Updated dependency write-excel-file to v2.0.5.

## 1.0.0

### Major Changes

- c5f33bf: Added community-plugin-xlsx.
