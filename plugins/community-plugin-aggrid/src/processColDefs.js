/*
  Copyright 2021 Lowdefy, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import { renderHtml } from '@lowdefy/block-utils';
import { type } from '@lowdefy/helpers';
import renderBlocks from './renderBlocks.js';

function recProcessColDefs(columnDefs, methods, components, events, blockColumns) {
  return columnDefs.map((col) => {
    const newColDef = {};
    if (type.isArray(col.children)) {
      newColDef.children = recProcessColDefs(col.children, methods, components);
    }
    if (type.isFunction(col.cellRenderer)) {
      newColDef.cellRenderer = (params) => {
        return renderHtml({
          html: col.cellRenderer(params),
          methods,
        });
      };
    } else if (type.isArray(col.blocks) || type.isArray(col.cellRenderer)) {
      //TODO: delete col.blocks
      const blocks = JSON.parse(JSON.stringify(col.blocks)) ?? col.cellRenderer;
      newColDef.cellRenderer = (params) => {
        return renderBlocks({
          blocks: blocks,
          methods,
          components,
          rowEvent: {
            row: params.data,
            rowIndex: params.rowIndex,
            index: parseInt(params.node.id),
            columnId: params.column.colId,
          },
          events,
          blockColumns,
        });
      };
      // delete col.blocks;
      // console.log('blocks: ', blocks);
      // col.cellRenderer = blocks;
    }
    return {
      ...col,
      ...newColDef,
    };
  });
}

function processColDefs(columnDefs = [], methods, components, events, blockColumns) {
  return recProcessColDefs(columnDefs, methods, components, events, blockColumns);
}

export default processColDefs;
