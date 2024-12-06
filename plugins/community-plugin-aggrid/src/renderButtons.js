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

import React, { useCallback } from 'react';

import Button from '@lowdefy/blocks-antd/blocks/Button/Button.js';

function renderButtons({ buttons, methods }) {
  // TODO: Register button events
  // buttons.array.forEach((button) => {
  //   methods.registerEvent({
  //     name: `${button.event}`
  //   });
  // });
  return (
    <div>
      {buttons.map((button) => {
        <Button
          blockId={`${button.blockId}_button`}
          // components={{ Icon, Link }}
          events={button.events}
          properties={button.properties}
          methods={button.methods}
          onClick={() => {}}
          rename={button.rename}
        />;
      })}
    </div>
  );
}

export default renderButtons;
