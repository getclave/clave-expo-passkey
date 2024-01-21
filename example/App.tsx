import { Button, StyleSheet, Text, View } from 'react-native';

import { Passkey } from 'clave-expo-passkey';
import { useState } from 'react';

export default function App() {
    const [result, setResult] = useState<string>('');
    const supported = Passkey.isSupported();

    async function createPasskey() {
        const passkey = await Passkey.create('test', 'test', 'deadbeef');
        setResult(JSON.stringify(passkey));
    }

    async function signWithPasskey() {
        const signature = await Passkey.sign([], 'deadbeef');
        setResult(JSON.stringify(signature));
    }

    return (
        <View style={styles.container}>
            <Text>Passkey supported: {supported ? 'Yes' : 'No'}</Text>
            <Text>Result: {result}</Text>
            <Button onPress={createPasskey} title="Create Passkey" />
            <Button onPress={signWithPasskey} title="Sign with Passkey" />
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
