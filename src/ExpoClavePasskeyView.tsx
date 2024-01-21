import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ExpoClavePasskeyViewProps } from './ExpoClavePasskey.types';

const NativeView: React.ComponentType<ExpoClavePasskeyViewProps> =
  requireNativeViewManager('ExpoClavePasskey');

export default function ExpoClavePasskeyView(props: ExpoClavePasskeyViewProps) {
  return <NativeView {...props} />;
}
