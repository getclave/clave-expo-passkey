import { Platform } from 'react-native';
import { NotSupportedError } from './ClaveExpoPasskey.errors';
import {
    CreateOptions,
    PasskeyAuthenticationRequest,
    PasskeyAuthenticationResult,
    PasskeyRegistrationRequest,
    PasskeyRegistrationResult,
    SignOptions,
} from './ClaveExpoPasskey.types';
import { NativeAndroid } from './NativeAndroid';
import { NativeiOS } from './NativeiOS';
import * as utils from './utils';

export class Passkey {
    static generateCreateRequest(
        userId: string,
        userName: string,
        challenge: string,
        options: Partial<CreateOptions>,
    ): PasskeyRegistrationRequest {
        return {
            challenge,
            rp: {
                id: 'getclave.io',
                name: 'Clave',
            },
            user: {
                id: userId,
                name: userName,
                displayName: options.displayName ?? userName,
            },
            pubKeyCredParams: [
                { alg: -7, type: 'public-key' }, // ES256 (Webauthn's default algorithm)
            ],
            timeout: options.timeout ?? 60000,
            authenticatorSelection: {
                userVerification: options.userVerification ?? 'preferred',
                authenticatorAttachment: 'platform',
                residentKey: options.discoverable ?? 'preferred',
                requireResidentKey: options.discoverable === 'required',
            },
            attestation: options.attestation ? 'direct' : 'none',
        };
    }

    static generateSignRequest(
        credentialIds: Array<string>,
        challenge: string,
        options: Partial<SignOptions>,
    ): PasskeyAuthenticationRequest {
        return {
            challenge,
            rpId: 'getclave.io',
            allowCredentials: credentialIds.map((id) => {
                return {
                    id,
                    type: 'public-key',
                    transports: ['hybrid', 'usb', 'ble', 'nfc'],
                };
            }),
            userVerification: options.userVerification ?? 'required',
            timeout: options.timeout ?? 60000,
        };
    }

    /**
     * Creates a new Passkey
     *
     * @param userId The user's unique identifier
     * @param userName The user's name
     * @param challenge The FIDO2 Challenge without formatting
     * @param options An object containing options for the registration process
     * @returns The FIDO2 Attestation Result in JSON format
     * @throws
     */
    public static async create(
        userId: string,
        userName: string,
        challenge: string,
        options: Partial<CreateOptions> = {},
    ): Promise<PasskeyRegistrationResult> {
        if (!Passkey.isSupported) {
            throw NotSupportedError;
        }

        const challengeBase64 = utils.hextoBase64(challenge);

        const request = this.generateCreateRequest(
            userId,
            userName,
            challengeBase64,
            options,
        );

        if (Platform.OS === 'android') {
            return NativeAndroid.register(request);
        } else if (Platform.OS === 'ios') {
            return NativeiOS.register(
                request,
                options.withSecurityKey ?? false,
            );
        }
        throw NotSupportedError;
    }

    /**
     * Authenticates using an existing Passkey and returns signature only
     *
     * @param credentialIds The credential IDs of the Passkey to authenticate with
     * @param challenge The FIDO2 Challenge without formatting
     * @options An object containing options for the authentication process
     * @returns The FIDO2 Assertion Result in JSON format
     * @throws
     */
    public static async sign(
        credentialIds: Array<string>,
        challenge: string,
        options: Partial<SignOptions> = {},
    ): Promise<string> {
        if (!Passkey.isSupported) {
            throw NotSupportedError;
        }

        const challengeBase64 = utils.hextoBase64(challenge);

        const request = this.generateSignRequest(
            credentialIds,
            challengeBase64,
            options,
        );

        let authResponse: PasskeyAuthenticationResult;

        if (Platform.OS === 'android') {
            authResponse = await NativeAndroid.authenticate(request);
        } else if (Platform.OS === 'ios') {
            authResponse = await NativeiOS.authenticate(
                request,
                options.withSecurityKey ?? false,
            );
        } else {
            throw NotSupportedError;
        }

        const base64Decoded = utils.base64ToHex(
            authResponse.response.signature,
        );
        const { r, s } = utils.derToRs(base64Decoded);
        return ['0x', r, s].join('');
    }

    /**
     * Authenticates using an existing Passkey and returns full response
     *
     * @param credentialIds The credential IDs of the Passkey to authenticate with
     * @param challenge The FIDO2 Challenge without formatting
     * @options An object containing options for the authentication process
     * @returns The FIDO2 Assertion Result in JSON format
     * @throws
     */
    public static async authenticate(
        credentialIds: Array<string>,
        challenge: string,
        options: Partial<SignOptions> = {},
    ): Promise<PasskeyAuthenticationResult> {
        if (!Passkey.isSupported) {
            throw NotSupportedError;
        }

        const challengeBase64 = utils.hextoBase64(challenge);

        const request = this.generateSignRequest(
            credentialIds,
            challengeBase64,
            options,
        );

        if (Platform.OS === 'android') {
            return NativeAndroid.authenticate(request);
        } else if (Platform.OS === 'ios') {
            return NativeiOS.authenticate(
                request,
                options.withSecurityKey ?? false,
            );
        } else {
            throw NotSupportedError;
        }
    }

    /**
     * Checks if Passkeys are supported on the current device
     *
     * @returns A boolean indicating whether Passkeys are supported
     */
    public static isSupported(): boolean {
        if (Platform.OS === 'android') {
            return Platform.Version > 28;
        }

        if (Platform.OS === 'ios') {
            return parseInt(Platform.Version, 10) > 15;
        }

        return false;
    }
}

export * from './ClaveExpoPasskey.types';
export * from './ClaveExpoPasskey.errors';
