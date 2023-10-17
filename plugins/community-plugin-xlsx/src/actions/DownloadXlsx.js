import { type } from '@lowdefy/helpers';
import writeXlsxFile from 'write-excel-file';

async function DownloadXlsx({ params }) {
  const { data, fileName, schema, ...options } = params;

  if (!type.isArray(data) || !type.isObject(data[0])) {
    throw new Error('Data should be an array of objects.');
  }

  const colTypes = {
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
  };

  await writeXlsxFile(data, {
    fileName: !type.isString(fileName) ? 'download.xlsx' : fileName,
    schema:
      type.isArray(schema) &&
      schema.map((column) => ({
        ...column,
        value: type.isString(column.value) ? (row) => row[column.value] : column.value,
        type: column.type ? colTypes[column.type] : undefined,
      })),
    ...options,
  });

  return;
}

export default DownloadXlsx;
