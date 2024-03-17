import { Platform } from 'react-native';
import { NotSupportedError } from './ExpoClavePasskey.errors';
import {
    AuthenticatorAttachment,
    AuthenticatorTransport,
    AuthenticatorType,
    CommonOptions,
    CreateOptions,
    PasskeyAuthenticationRequest,
    PasskeyAuthenticationResult,
    PasskeyRegistrationRequest,
    PasskeyRegistrationResult,
    PublicKeyCredentialDescriptor,
    SignOptions,
} from './ExpoClavePasskey.types';
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
        const request: PasskeyRegistrationRequest = {
            challenge,
            rp: options.rp ?? {
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
            authenticatorSelection: {
                requireResidentKey: true,
                residentKey: 'required',
                authenticatorAttachment: this.getAuthAttachment(
                    options.authenticatorType,
                ),
            },
        };

        return request;
    }

    static generateSignRequest(
        credentialIds: Array<string>,
        challenge: string,
        options: Partial<SignOptions>,
    ): PasskeyAuthenticationRequest {
        return {
            challenge,
            rpId: options.rpId ?? 'getclave.io',
            allowCredentials: credentialIds.map((credentialId) =>
                this.credentialIdToDescriptor(credentialId, options),
            ),
        };
    }

    /**
     * Creates a new Passkey
     *
     * @param userId The user's unique identifier
     * @param userName The user's name
     * @param challenge The FIDO2 Challenge in hex format
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

        challenge = utils.stripHexPrefix(challenge);
        if (!utils.isValidHex(challenge)) {
            throw new Error('Invalid hex challenge');
        }

        const challengeBase64 = utils.hextoBase64(challenge);

        const request = this.generateCreateRequest(
            userId,
            userName,
            challengeBase64,
            options,
        );

        if (Platform.OS === 'android') {
            // Android requires base64url encoding for user id and challenge
            request.user.id = utils.base64ToBase64Url(request.user.id);
            request.challenge = utils.base64ToBase64Url(request.challenge);
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

        challenge = utils.stripHexPrefix(challenge);
        if (!utils.isValidHex(challenge)) {
            throw new Error('Invalid hex challenge');
        }

        const challengeBase64 = utils.hextoBase64(challenge);

        const request = this.generateSignRequest(
            credentialIds,
            challengeBase64,
            options,
        );

        let authResponse: PasskeyAuthenticationResult;

        if (Platform.OS === 'android') {
            // Android requires base64url encoding for challenge
            request.challenge = utils.base64ToBase64Url(request.challenge);
            authResponse = await NativeAndroid.authenticate(
                request,
                options.preserveCredentials ?? false,
            );
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

        challenge = utils.stripHexPrefix(challenge);
        if (!utils.isValidHex(challenge)) {
            throw new Error('Invalid hex challenge');
        }

        const challengeBase64 = utils.hextoBase64(challenge);

        const request = this.generateSignRequest(
            credentialIds,
            challengeBase64,
            options,
        );

        if (Platform.OS === 'android') {
            return NativeAndroid.authenticate(
                request,
                options.preserveCredentials ?? false,
            );
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

    static getAuthAttachment(
        authType?: CommonOptions['authenticatorType'],
    ): AuthenticatorAttachment | undefined {
        if (authType === 'local') return 'platform';
        if (authType === 'roaming' || authType === 'extern')
            return 'cross-platform';
        if (authType === 'both') return undefined; // The webauthn protocol considers `null` as invalid but `undefined` as "both"!

        // the default case: "platform"
        return 'platform';
    }

    static getTransports(
        authType?: AuthenticatorType,
    ): AuthenticatorTransport[] {
        const local: AuthenticatorTransport[] = ['internal'];

        // 'hybrid' was added mid-2022 in the specs and currently not yet available in the official dom types
        // @ts-ignore
        const roaming: AuthenticatorTransport[] = [
            'hybrid',
            'usb',
            'ble',
            'nfc',
        ];

        if (authType === 'local') return local;
        if (authType == 'roaming' || authType === 'extern') return roaming;
        if (authType === 'both') return [...local, ...roaming];

        // the default case: "platform" (local)
        return local;
    }

    static credentialIdToDescriptor = (
        credentialId: string,
        options: Partial<SignOptions> = {},
    ): PublicKeyCredentialDescriptor => ({
        id: credentialId,
        type: 'public-key',
        transports: this.getTransports(options.authenticatorType),
    });
}

export * from './ExpoClavePasskey.types';
export * from './ExpoClavePasskey.errors';
