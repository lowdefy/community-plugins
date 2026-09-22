import { type, get } from '@lowdefy/helpers';
import writeXlsxFile from 'write-excel-file';

function createValueFunction(column) {
  if (type.isFunction(column.value)) {
    return column.value;
  }
  if (column.type === 'Array') {
    return (row) => get(row, column.value)?.filter(Boolean).join(', ');
  }
  return (row) => get(row, column.value);
}

async function DownloadXlsx({ params }) {
  const { data, fileName, schema, ...options } = params;
  // data must be an array of objects. An empty array is valid: write-excel-file accepts empty
  // data (a header row when the schema defines column titles, otherwise an empty sheet), so a
  // filter matching no rows still downloads. Every element is checked, not just the first, so a
  // malformed row surfaces this error instead of a confusing failure inside write-excel-file.
  if (!type.isArray(data) || data.some((row) => !type.isObject(row))) {
    throw new Error('Data should be an array of objects.');
  }
  if (!type.isArray(schema) || !type.isObject(schema[0])) {
    throw new Error('Schema should be an array of objects.');
  }
  const colTypes = {
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Array: String,
  };

  await writeXlsxFile(data, {
    fileName: !type.isString(fileName) ? 'download.xlsx' : fileName,
    schema: schema.map((column) => ({
      ...column,
      value: createValueFunction(column),
      type: get(colTypes, column.type) ?? column.type,
    })),
    ...options,
  });
  return;
}

export default DownloadXlsx;
