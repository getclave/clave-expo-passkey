import { Platform } from 'react-native';
import { NotSupportedError } from './ExpoClavePasskey.errors';
import {
    CredentialDescriptor,
    PasskeyAuthenticationOptions,
    PasskeyAuthenticationResult,
    PasskeyCreateOptions,
    PasskeyCreateResult,
    User,
} from './ExpoClavePasskey.types';
import { NativeAndroid } from './NativeAndroid';
import { NativeiOS } from './NativeiOS';
import * as utils from './utils';

export class Passkey {
    static credentialIdToDescriptor = (
        credentialId: string,
    ): CredentialDescriptor => ({
        id: credentialId,
        type: 'public-key',
        transports: ['internal'],
    });

    /** Applies defaults to create request */
    static generateCreateRequest(
        user: User,
        challenge: string,
        overrides: Partial<PasskeyCreateOptions>,
    ): PasskeyCreateOptions {
        return {
            challenge,
            rp: overrides.rp ?? {
                id: 'getclave.io',
                name: 'Clave',
            },
            user: overrides.user ?? user,
            pubKeyCredParams: overrides.pubKeyCredParams ?? [
                { alg: -7, type: 'public-key' }, // ES256 (Webauthn's default algorithm)
            ],
            authenticatorSelection: overrides.authenticatorSelection ?? {
                authenticatorAttachment: 'platform',
                residentKey: 'required',
                requireResidentKey: true,
            },
        };
    }

    /** Applies defaults to authentication request */
    static generateAuthenticationRequest(
        credentialIds: Array<string>,
        challenge: string,
        overrides: Partial<PasskeyAuthenticationOptions>,
    ): PasskeyAuthenticationOptions {
        return {
            challenge,
            rpId: overrides.rpId ?? 'getclave.io',
            allowCredentials: credentialIds.map(this.credentialIdToDescriptor),
        };
    }

    /**
     * Creates a new Passkey
     *
     * @param `userId`      The user's unique identifier
     * @param `userName`    The user's name
     * @param `challenge`   Challenge in hex format
     * @param `override`    Overrides for credential creation
     */
    public static async create(
        user: User,
        challenge: string,
        overrides: Partial<PasskeyCreateOptions> = {},
    ): Promise<PasskeyCreateResult> {
        if (!Passkey.isSupported) {
            throw new NotSupportedError();
        }

        const challengeBase64Url = utils.hexToBase64Url(challenge);

        const request = this.generateCreateRequest(
            user,
            challengeBase64Url,
            overrides,
        );

        if (Platform.OS === 'android') {
            return NativeAndroid.register(request);
        } else if (Platform.OS === 'ios') {
            return NativeiOS.register(request);
        } else {
            throw new NotSupportedError();
        }
    }

    /**
     * Authenticates using an existing Passkey
     * @param `credentialIds` Allowed credential IDs, base64url encoded
     * @param `challenge` Challenge in hex format
     * @param `overrides` Overrides for authentication
     * @returns The FIDO2 Assertion Result in JSON format
     * @throws
     */
    public static async authenticate(
        credentialIds: Array<string>,
        challenge: string,
        overrides: Partial<PasskeyAuthenticationOptions> = {},
    ): Promise<PasskeyAuthenticationResult> {
        if (!Passkey.isSupported) {
            throw new NotSupportedError();
        }

        const challengeBase64Url = utils.hexToBase64Url(challenge);
        const request = this.generateAuthenticationRequest(
            credentialIds,
            challengeBase64Url,
            overrides,
        );

        if (Platform.OS === 'android') {
            return NativeAndroid.authenticate(request);
        } else if (Platform.OS === 'ios') {
            return NativeiOS.authenticate(request);
        } else {
            throw new NotSupportedError();
        }
    }

    /**
     * Checks if Passkeys are supported on the current device
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

export * from './ExpoClavePasskey.types';
export * from './ExpoClavePasskey.errors';
