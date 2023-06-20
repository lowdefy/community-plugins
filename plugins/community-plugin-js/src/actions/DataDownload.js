async function DataDownload({
  methods: { request, setState },
  params: { requestName, filename = 'data_export.csv', pageSize = 2000, fields },
}) {
  if (!requestName) {
    throw new Error('DataDownload requires a request name.');
  }

  let skip = 0;
  await setState({ data_download: { skip, pageSize } });
  let response = await request(requestName);
  let data = response[0];

  while (response[0].length === pageSize) {
    skip = skip + pageSize;
    await setState({ data_download: { skip, pageSize } });
    response = await request(requestName);
    data = data.concat(response[0]);
  }

  if (!fields) {
    fields = Object.keys(data[0]);
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
