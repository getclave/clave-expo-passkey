import * as React from 'react';

import { ExpoClavePasskeyViewProps } from './ExpoClavePasskey.types';

export default function ExpoClavePasskeyView(props: ExpoClavePasskeyViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
