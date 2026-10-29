import { type, get } from '@lowdefy/helpers';
import writeXlsxFile from 'write-excel-file';

const colTypes = {
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Array: String,
};

function createValueFunction(column) {
  if (type.isFunction(column.value)) {
    return column.value;
  }
  if (column.type === 'Array') {
    return (row) => get(row, column.value)?.filter(Boolean).join(', ');
  }
  return (row) => get(row, column.value);
}

// rows must be an array of objects. An empty array is valid: write-excel-file accepts empty
// data (a header row when the schema defines column titles, otherwise an empty sheet), so a
// filter matching no rows still downloads. Missing rows (e.g. a request that returned nothing)
// are treated the same as an empty array. Every element is checked, not just the first, so a
// malformed row surfaces this error instead of a confusing failure inside write-excel-file.
function createRows(rows) {
  const checkedRows = rows ?? [];
  if (!type.isArray(checkedRows) || checkedRows.some((row) => !type.isObject(row))) {
    throw new Error('Data should be an array of objects.');
  }
  return checkedRows;
}

function createSchema(columns) {
  if (!type.isArray(columns) || !type.isObject(columns[0])) {
    throw new Error('Schema should be an array of objects.');
  }
  return columns.map((column) => ({
    ...column,
    value: createValueFunction(column),
    type: get(colTypes, column.type) ?? column.type,
  }));
}

async function DownloadXlsx({ params }) {
  const { data, fileName, schema, sheets, ...options } = params;
  const xlsxFileName = !type.isString(fileName) ? 'download.xlsx' : fileName;

  // write-excel-file writes one sheet per name in sheets, and then takes data and schema as one
  // entry per sheet, in the same order.
  if (type.isArray(sheets)) {
    if (!type.isArray(data) || data.length !== sheets.length) {
      throw new Error('With sheets, data should be an array with the rows of each sheet.');
    }
    if (!type.isArray(schema) || schema.length !== sheets.length) {
      throw new Error('With sheets, schema should be an array with the schema of each sheet.');
    }
    await writeXlsxFile(data.map(createRows), {
      fileName: xlsxFileName,
      sheets,
      schema: schema.map(createSchema),
      ...options,
    });
    return;
  }

  await writeXlsxFile(createRows(data), {
    fileName: xlsxFileName,
    schema: createSchema(schema),
    ...options,
  });
  return;
}

export default DownloadXlsx;
