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

import React from 'react';

import Tag from '@lowdefy/blocks-antd/blocks/Tag/Tag.js';
import Button from '@lowdefy/blocks-antd/blocks/Button/Button.js';

const typeMap = {
  Button: ({ block, methods, components, rowEvent, events, eventId }) => {
    return (
      <Button
        blockId={eventId}
        components={components}
        methods={methods}
        events={events}
        properties={block.properties}
        rename={{
          events: {
            onClick: eventId,
          },
        }}
        onClick={() => methods.triggerEvent({ name: eventId, event: rowEvent })}
      />
    );
  },
  Tag: ({ block, methods, components, rowEvent, events, eventId }) => {
    return (
      <Tag
        blockId={eventId}
        components={components}
        methods={methods}
        properties={block.properties}
        onClick={() => methods.triggerEvent({ name: eventId, event: rowEvent })}
      />
    );
  },
};

function registerEvent({ methods, eventId, actions, events }) {
  if (events[eventId] || !actions) return;
  methods.registerEvent({
    name: eventId,
    actions,
  });
}

function renderBlocks({ blocks, methods, components, rowEvent, events }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {blocks.map((block, index) => {
        const eventId = `${block.id}_${rowEvent.rowIndex}_${index}_actions`;
        registerEvent({ methods, eventId, actions: block.events?.onClick, events });
        return typeMap[block.type]({ block, methods, components, rowEvent, events, eventId });
      })}
    </div>
  );
}

export default renderBlocks;
