// The paged request reads skip and pageSize from state, so each page must be written to state
// and awaited before the request is called again — the request has no arguments of its own.
async function fetchAllPages({ request, setState, requestName, pageSize, stateKey }) {
  let skip = 0;
  await setState({ [stateKey]: { skip, pageSize } });
  let response = await request(requestName);
  let data = response[0];

  while (response[0].length === pageSize) {
    skip = skip + pageSize;
    await setState({ [stateKey]: { skip, pageSize } });
    response = await request(requestName);
    data = data.concat(response[0]);
  }

  return data;
}

export default fetchAllPages;
