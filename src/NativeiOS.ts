import { handleNativeError } from './ExpoClavePasskey.errors';
import {
    PasskeyAuthenticationRequest,
    PasskeyAuthenticationResult,
    PasskeyRegistrationRequest,
    PasskeyRegistrationResult,
} from './ExpoClavePasskey.types';
import * as utils from './utils';
import ExpoClavePasskey from './ExpoClavePasskeyModule';

export class NativeiOS {
    /**
     * iOS implementation of the registration process
     *
     * @param request The FIDO2 Attestation Request in JSON format
     * @param withSecurityKey A boolean indicating wether a security key should be used for registration
     * @returns The FIDO2 Attestation Result in JSON format
     */
    public static async register(
        request: PasskeyRegistrationRequest,
        withSecurityKey = false,
    ): Promise<PasskeyRegistrationResult> {
        // Extract the required data from the attestation request
        const { rpId, challenge, name, userID } =
            this.prepareRegistrationRequest(request);

        try {
            const response = await ExpoClavePasskey.register(
                rpId,
                challenge,
                name,
                userID,
                withSecurityKey,
            );
            return this.handleNativeRegistrationResult(response);
        } catch (error) {
            throw handleNativeError(error);
        }
    }

    /**
     * Extracts the data required for the attestation process on iOS from a given request
     */
    private static prepareRegistrationRequest(
        request: PasskeyRegistrationRequest,
    ): PasskeyiOSRegistrationData {
        return {
            rpId: request.rp.id,
            challenge: request.challenge,
            name: request.user.displayName,
            userID: request.user.id,
        };
    }

    /**
     * Transform the iOS-specific attestation result into a FIDO2 result
     */
    private static handleNativeRegistrationResult(
        result: PasskeyiOSRegistrationResult,
    ): PasskeyRegistrationResult {
        return {
            id: result.credentialID,
            rawId: result.credentialID,
            response: {
                clientDataJSON: utils.base64ToBase64Url(
                    result.response.rawClientDataJSON,
                ),
                attestationObject: utils.base64ToBase64Url(
                    result.response.rawAttestationObject,
                ),
            },
        };
    }

    /**
     * iOS implementation of the authentication process
     *
     * @param request The FIDO2 Assertion Request in JSON format
     * @param withSecurityKey A boolean indicating wether a security key should be used for authentication
     * @returns The FIDO2 Assertion Result in JSON format
     */
    public static async authenticate(
        request: PasskeyAuthenticationRequest,
        withSecurityKey = false,
    ): Promise<PasskeyAuthenticationResult> {
        try {
            const response = await ExpoClavePasskey.authenticate(
                request.rpId,
                request.challenge,
                request.allowCredentials?.map((credential) => credential.id) ??
                    [],
                withSecurityKey,
            );
            return this.handleNativeAuthenticationResult(response);
        } catch (error) {
            throw handleNativeError(error);
        }
    }

    /**
     * Transform the iOS-specific assertion result into a FIDO2 result
     */
    private static handleNativeAuthenticationResult(
        result: PasskeyiOSAuthenticationResult,
    ): PasskeyAuthenticationResult {
        return {
            id: result.credentialID,
            rawId: result.credentialID,
            response: {
                clientDataJSON: utils.base64ToBase64Url(
                    result.response.rawClientDataJSON,
                ),
                authenticatorData: utils.base64ToBase64Url(
                    result.response.rawAuthenticatorData,
                ),
                signature: utils.base64ToBase64Url(result.response.signature),
                userHandle: result.userID,
            },
        };
    }
}

interface PasskeyiOSRegistrationData {
    rpId: string;
    challenge: string;
    name: string;
    userID: string;
}

interface PasskeyiOSRegistrationResult {
    credentialID: string;
    response: {
        rawAttestationObject: string;
        rawClientDataJSON: string;
    };
}

interface PasskeyiOSAuthenticationResult {
    credentialID: string;
    userID: string;
    response: {
        rawAuthenticatorData: string;
        rawClientDataJSON: string;
        signature: string;
    };
}
