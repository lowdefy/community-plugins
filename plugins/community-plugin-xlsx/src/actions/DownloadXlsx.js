import { type } from '@lowdefy/helpers';
import writeXlsxFile from 'write-excel-file';

async function DownloadXlsx({ params }) {
  const { data, fileName, schema, ...options } = params;

  if (!type.isArray(data) || !type.isObject(data[0])) {
    throw new Error('Data should be an array of objects.');
  }

  await writeXlsxFile(data, {
    fileName: !type.isString(fileName) ? 'download.xlsx' : fileName,
    schema:
      type.isArray(schema) &&
      schema.map((column) => {
        let colType;
        switch (column.type) {
          case 'String':
            colType = String;
            break;
          case 'Number':
            colType = Number;
            break;
          case 'Boolean':
            colType = Boolean;
            break;
          case 'Date':
            colType = Date;
            break;
          default:
            break;
        }
        return {
          ...column,
          value: type.isString(column.value) ? (row) => row[column.value] : column.value,
          type: colType,
        };
      }),
    ...options,
  });

  return;
}

export default DownloadXlsx;
