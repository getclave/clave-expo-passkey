import { StyleSheet, Text, View } from 'react-native';

import * as ExpoClavePasskey from 'clave-expo-passkey';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ExpoClavePasskey.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
