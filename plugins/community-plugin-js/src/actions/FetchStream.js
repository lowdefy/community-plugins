async function FetchStream({ globals, params }) {
  const { fetch } = globals;
  const { url, options } = params;
  const res = await fetch(url, options);
  const data = await new Response(res.body).text();
  return data;
}

export default FetchStream;
