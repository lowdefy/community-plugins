import fetchAllPages from './fetchAllPages.js';

async function DataDownload({
  methods: { request, setState },
  params: { requestName, filename = 'data_export.csv', pageSize = 2000, fields },
}) {
  if (!requestName) {
    throw new Error('DataDownload requires a request name.');
  }

  const data = await fetchAllPages({
    request,
    setState,
    requestName,
    pageSize,
    stateKey: 'data_download',
  });

  if (!fields) {
    // No rows means no columns to infer; fall back to an empty header so an empty result set
    // downloads an empty CSV instead of throwing on Object.keys(undefined).
    fields = Object.keys(data[0] ?? {});
  }
  const arrays = [fields];
  data.forEach((obj) => arrays.push(fields.map((field) => obj[field])));
  const csv = arrays
    .map((row) =>
      row
        .map((cell) => (typeof cell === 'undefined' || cell === null ? '' : cell))
        .map(String)
        .map((v) => v.replaceAll('"', '""'))
        .map((v) => `"${v}"`)
        .join(',')
    )
    .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.href = url;
  el.setAttribute('download', filename);
  el.click();
}

export default DataDownload;
