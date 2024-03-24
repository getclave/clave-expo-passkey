import { handleNativeError } from './ExpoClavePasskey.errors';
import {
    PasskeyCreateOptions,
    PasskeyCreateResult,
    PasskeyAuthenticationOptions,
    PasskeyAuthenticationResult,
} from './ExpoClavePasskey.types';
import ExpoClavePasskey from './ExpoClavePasskeyModule';

export type iOSCreateResult = {
    credentialID: string;
    response: {
        rawAttestationObject: string;
        rawClientDataJSON: string;
    };
};

export type iOSAuthenticationResult = {
    credentialID: string;
    userID: string;
    response: {
        rawAuthenticatorData: string;
        rawClientDataJSON: string;
        signature: string;
    };
};

export class NativeiOS {
    /**
     * iOS implementation of the registration process
     * @param request The FIDO2 Attestation Request in JSON format
     * @param withSecurityKey A boolean indicating wether a security key should be used for registration
     * @returns The FIDO2 Attestation Result in JSON format
     */
    public static async register(
        request: PasskeyCreateOptions,
    ): Promise<PasskeyCreateResult> {
        try {
            const response = await ExpoClavePasskey.register(
                request.challenge,
                request.rp.id,
                request.user.id,
                request.user.displayName,
            );
            return this.parseCreateResult(response);
        } catch (error) {
            throw handleNativeError(error);
        }
    }

    /**
     * Transform the iOS-specific attestation result into a FIDO2 result
     */
    private static parseCreateResult(
        result: iOSCreateResult,
    ): PasskeyCreateResult {
        return {
            id: result.credentialID,
            rawId: result.credentialID,
            type: 'webauthn.create',
            response: {
                clientDataJSON: result.response.rawClientDataJSON,
                attestationObject: result.response.rawAttestationObject,
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
        request: PasskeyAuthenticationOptions,
    ): Promise<PasskeyAuthenticationResult> {
        try {
            const response = await ExpoClavePasskey.authenticate(
                request.challenge,
                request.allowCredentials?.map(({ id }) => id) ?? [],
                request.rpId,
            );
            return this.parseAuthenticationResult(response);
        } catch (error) {
            throw handleNativeError(error);
        }
    }

    /**
     * Transform the iOS-specific authentication result into a FIDO2 result
     */
    private static parseAuthenticationResult(
        result: iOSAuthenticationResult,
    ): PasskeyAuthenticationResult {
        return {
            id: result.credentialID,
            rawId: result.credentialID,
            type: 'webauthn.get',
            response: {
                clientDataJSON: result.response.rawClientDataJSON,
                authenticatorData: result.response.rawAuthenticatorData,
                signature: result.response.signature,
                userHandle: result.userID,
            },
        };
    }
}
