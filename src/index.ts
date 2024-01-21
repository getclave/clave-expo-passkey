import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ExpoClavePasskey.web.ts
// and on native platforms to ExpoClavePasskey.ts
import ExpoClavePasskeyModule from './ExpoClavePasskeyModule';
import ExpoClavePasskeyView from './ExpoClavePasskeyView';
import { ChangeEventPayload, ExpoClavePasskeyViewProps } from './ExpoClavePasskey.types';

// Get the native constant value.
export const PI = ExpoClavePasskeyModule.PI;

export function hello(): string {
  return ExpoClavePasskeyModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoClavePasskeyModule.setValueAsync(value);
}

const emitter = new EventEmitter(ExpoClavePasskeyModule ?? NativeModulesProxy.ExpoClavePasskey);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ExpoClavePasskeyView, ExpoClavePasskeyViewProps, ChangeEventPayload };
