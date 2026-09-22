# @lowdefy/community-plugin-js

JavaScript actions for Lowdefy apps.

## Installation

```bash
npm install @lowdefy/community-plugin-js
# or
pnpm add @lowdefy/community-plugin-js
```

```yaml
plugins:
  - name: '@lowdefy/community-plugin-js'
    version: 1.0.3
    types:
      - '@lowdefy/community-plugin-js/types'
```

## Actions

### DataDownload

Pages a request until a short page is returned, then builds a CSV from the concatenated rows and
triggers a browser download.

Params:

| Param         | Type       | Required | Default           | Description                  |
| ------------- | ---------- | -------- | ----------------- | ---------------------------- |
| `requestName` | `string`   | Yes      |                   | Id of the request to page.   |
| `filename`    | `string`   | No       | `data_export.csv` | Name of the downloaded file. |
| `pageSize`    | `number`   | No       | `2000`            | Rows per request call.       |
| `fields`      | `string[]` | No       | Keys of first row | Columns to write, in order.  |

The request must read its pagination from state:

```yaml
- id: fetch_rows
  type: MongoDBAggregation
  connectionId: rows
  properties:
    pipeline:
      - $match: ...
      - $skip:
          _state: data_download.skip
      - $limit:
          _state: data_download.pageSize
```

### DataFetch

Pages a request until a short page is returned and returns the concatenated rows.

Params:

| Param         | Type     | Required | Default | Description                |
| ------------- | -------- | -------- | ------- | -------------------------- |
| `requestName` | `string` | Yes      |         | Id of the request to page. |
| `pageSize`    | `number` | No       | `2000`  | Rows per request call.     |

The request must read its pagination from state:

```yaml
- id: fetch_rows
  type: MongoDBAggregation
  connectionId: rows
  properties:
    pipeline:
      - $match: ...
      - $skip:
          _state: data_fetch.skip
      - $limit:
          _state: data_fetch.pageSize
```

Returns an array of all rows returned by the request across every page.

### FetchStream

Fetches a URL and returns the response body as text.

| Param     | Type     | Required | Default | Description              |
| --------- | -------- | -------- | ------- | ------------------------ |
| `url`     | `string` | Yes      |         | URL to fetch.            |
| `options` | `object` | No       |         | `fetch` request options. |
