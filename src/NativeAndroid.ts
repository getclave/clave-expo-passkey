import { handleNativeError } from './ExpoClavePasskey.errors';
import {
    PasskeyAuthenticationRequest,
    PasskeyAuthenticationResult,
    PasskeyRegistrationRequest,
    PasskeyRegistrationResult,
} from './ExpoClavePasskey.types';
import ExpoClavePasskey from './ExpoClavePasskeyModule';
import * as utils from './utils';

export class NativeAndroid {
    /**
     * Android implementation of the registration process
     *
     * @param request The FIDO2 Attestation Request in JSON format
     * @returns The FIDO2 Attestation Result in JSON format
     */
    public static async register(
        request: PasskeyRegistrationRequest,
    ): Promise<PasskeyRegistrationResult> {
        const nativeRequest = this.prepareRegistrationRequest(request);

        try {
            const response = await ExpoClavePasskey.register(
                JSON.stringify(nativeRequest),
            );
            return JSON.parse(response);
        } catch (error) {
            throw handleNativeError(error);
        }
    }

    /**
     * Android implementation of the authentication process
     *
     * @param request The FIDO2 Assertion Request in JSON format
     * @returns The FIDO2 Assertion Result in JSON format
     */
    public static async authenticate(
        request: PasskeyAuthenticationRequest,
    ): Promise<PasskeyAuthenticationResult> {
        const nativeRequest = this.prepareAuthRequest(request);

        try {
            const response = await ExpoClavePasskey.authenticate(
                JSON.stringify(nativeRequest),
            );
            return JSON.parse(response);
        } catch (error) {
            throw handleNativeError(error);
        }
    }

    /**
     * Prepares the assertion request for Android
     */
    public static prepareAuthRequest(
        _request: PasskeyAuthenticationRequest,
    ): object {
        const request = { ..._request };
        // Convert the credentials to Base64URL
        if (request.allowCredentials != undefined) {
            request.allowCredentials = request.allowCredentials.map(
                (credential) => {
                    return {
                        ...credential,
                        id: utils.base64ToBase64Url(credential.id),
                    };
                },
            );
        }
        request.challenge = utils.base64ToBase64Url(request.challenge);

        return request;
    }

    /**
     * Prepares the assertion request for Android
     */
    public static prepareRegistrationRequest(
        _request: PasskeyRegistrationRequest,
    ): object {
        // Android requires base64url encoding for user id and challenge
        const request = { ..._request };
        request.user.id = utils.base64ToBase64Url(request.user.id);
        request.challenge = utils.base64ToBase64Url(request.challenge);
        return request;
    }
}
