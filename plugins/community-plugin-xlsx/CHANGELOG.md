# @lowdefy/community-plugin-xlsx

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
