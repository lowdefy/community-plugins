import { type, get } from '@lowdefy/helpers';
import writeXlsxFile from 'write-excel-file';

const createGetValue = ({ column }) => {
  if (type.isString(column.value)) {
    if (column.type === 'Array') {
      return (row) => get(row, column.value).filter(Boolean).join(',');
    }
    return (row) => get(row, column.value);
  }
  return column.value;
}

async function DownloadXlsx({ params  }) {
    const { data , fileName , schema , ...options } = params;
    if (!type.isArray(data) || !type.isObject(data[0])) {
        throw new Error('Data should be an array of objects.');
    }
    const colTypes = {
        String: String,
        Number: Number,
        Boolean: Boolean,
        Date: Date,
        Array: String
    };
    await writeXlsxFile(data, {
        fileName: !type.isString(fileName) ? 'download.xlsx' : fileName,
        schema: type.isArray(schema) && schema.map((column)=>({
                ...column,
                value: createGetValue({ column }),
                type: type.isString(column.type) ? get(colTypes, column.type) ?? column.type : undefined
            })),
        ...options
    });
    return;
}

export default DownloadXlsx;
