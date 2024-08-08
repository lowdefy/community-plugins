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
  if (!type.isArray(data) || !type.isObject(data[0])) {
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
