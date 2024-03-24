import { handleNativeError } from './ExpoClavePasskey.errors';
import {
    PasskeyAuthenticationOptions,
    PasskeyAuthenticationResult,
    PasskeyCreateOptions,
    PasskeyCreateResult,
} from './ExpoClavePasskey.types';
import ExpoClavePasskey from './ExpoClavePasskeyModule';

export class NativeAndroid {
    /**
     * Android implementation of the registration process
     * @param `request` The FIDO2 Attestation Request in JSON format
     * @returns The FIDO2 Attestation Result in JSON format
     */
    public static async register(
        request: PasskeyCreateOptions,
    ): Promise<PasskeyCreateResult> {
        try {
            const response = await ExpoClavePasskey.register(
                JSON.stringify(request),
            );
            return this.parseResponse(JSON.parse(response));
        } catch (error: unknown) {
            throw handleNativeError(error);
        }
    }

    /**
     * Android implementation of the authentication process
     * @param `request` The FIDO2 Assertion Request in JSON format
     * @returns The FIDO2 Assertion Result in JSON format
     */
    public static async authenticate(
        request: PasskeyAuthenticationOptions,
    ): Promise<PasskeyAuthenticationResult> {
        try {
            const response = await ExpoClavePasskey.authenticate(
                JSON.stringify(request),
            );
            return this.parseResponse(JSON.parse(response));
        } catch (error: unknown) {
            throw handleNativeError(error);
        }
    }

    /** Adds rawId to the Android response */
    private static parseResponse<AndroidResponse extends { id: string }>(
        response: AndroidResponse,
    ): AndroidResponse {
        return {
            ...response,
            rawId: response.id,
        };
    }
}
