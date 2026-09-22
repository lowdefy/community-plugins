import fetchAllPages from './fetchAllPages.js';

async function DataFetch({
  methods: { request, setState },
  params: { requestName, pageSize = 2000 },
}) {
  if (!requestName) {
    throw new Error('DataFetch requires a request name.');
  }

  return fetchAllPages({ request, setState, requestName, pageSize, stateKey: 'data_fetch' });
}

export default DataFetch;
