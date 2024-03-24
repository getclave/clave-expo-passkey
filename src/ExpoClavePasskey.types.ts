export type RelyingParty = {
    /** Relying Party ID, can be any string */
    id: string;
    /** Relying Party name, can be any string */
    name: string;
};

export type User = {
    /** User ID, encoded as base64url */
    id: string;
    /** User name, can be any string */
    name: string;
    /** User display name, can be any string. This is what is shown to the user */
    displayName: string;
};

export type PublicKeyCredentialParameters = {
    /** @note Credential type is always 'public-key' */
    type: string;
    /**
     * The algorithm used for the credential
     * - `-7`: P256
     * - `-257`: RS256
     */
    alg: number;
};

export type CredentialDescriptor = {
    /** @note Credential type is always 'public-key' */
    type: string;
    /** ID for the credential, base64url encoded */
    id: string;
    /**
     * The authenticator transports that the caller is willing to use.
     * @note For mobile phone authenticators, use 'internal'
     */
    transports?: Array<
        'usb' | 'ble' | 'nfc' | 'smart-card' | 'hybrid' | 'internal'
    >;
};

/**
 * Specifies requirements regarding authenticator attributes.
 */
export type AuthenticatorSelectionCriteria = {
    /**
     * "platform": Use platform specific authenticator.
     * "cross-platform": Use cross-platform authenticator (e.g. security key)
     * @note To use mobile phone as authenticator, set this to "platform"
     */
    authenticatorAttachment: 'platform' | 'cross-platform';
    /**
     * Whether the authenticator should support resident keys (aka passkeys).
     * @note Default is "discouraged" if `requireResidentKey` is false and
     * "required" else.
     */
    residentKey: 'discouraged' | 'preferred' | 'required';
    /**
     * Whether to use resident keys (aka passkeys).
     */
    requireResidentKey: boolean;
    /**
     * Specifies requirements regarding user verification.
     * @note For mobile phone authenticators, this is ignored.
     */
    userVerification: 'preferred' | 'required' | 'discouraged';
};

export type PasskeyCreateOptions = {
    /** Relying party options */
    rp: RelyingParty;
    /** User options */
    user: User;
    /** Challenge, base64url encoded */
    challenge: string;
    /** Public key credential params */
    pubKeyCredParams: Array<PublicKeyCredentialParameters>;
    /** Timeout for the operation, in milliseconds */
    timeout?: number;
    /** Credential IDs to excluded from creation */
    excludeCredentials?: Array<CredentialDescriptor>;
    /** Authenticator selection criteria */
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    /** Information sent to relying party about the authenticator */
    attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
    /** Format of the attestation, can be ignored */
    attestationFormats?: Array<string>;
    /** Hints sent to authenticator, can be ignored */
    hints?: Array<string>;
    /** Extensions sent to authenticator, can be ignored */
    extensions?: Record<string, unknown>;
};

export type PasskeyAuthenticationOptions = {
    /** Challenge, base64url encoded */
    challenge: string;
    /** Timeout for the operation, in milliseconds */
    timeout?: number;
    /** Relying party ID */
    rpId: RelyingParty['id'];
    /** Allowed credentials for the operation */
    allowCredentials?: Array<CredentialDescriptor>;
    /**
     * Specifies requirements regarding user verification.
     * @note For mobile phone authenticators, this is ignored.
     */
    userVerification: 'preferred' | 'required' | 'discouraged';
    /** Hints sent to authenticator, can be ignored */
    hints?: Array<string>;
    /** Extensions sent to authenticator, can be ignored */
    extensions?: Record<string, unknown>;
};

/**
 * The available options for Passkey operations
 */
export interface PasskeyOptions {
    withSecurityKey: boolean; // iOS only
}

// https://www.w3.org/TR/webauthn-2/#dictionary-credential-descriptor
export interface PublicKeyCredentialDescriptor {
    type: string;
    id: string;
    transports?: Array<string>;
}

/**
 * The FIDO2 Attestation Request
 * https://www.w3.org/TR/webauthn-2/#dictionary-makecredentialoptions
 */
export interface PasskeyRegistrationRequest {
    challenge: string;
    rp: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        displayName: string;
    };
    pubKeyCredParams: Array<{ type: string; alg: number }>;
    timeout?: number;
    authenticatorSelection?: {
        authenticatorAttachment?: AuthenticatorAttachment;
        requireResidentKey?: boolean;
        residentKey?: string;
        userVerification?: string;
    };
    attestation?: string;
    extensions?: Record<string, unknown>;
}

/**
 * The FIDO2 Attestation Result
 */
export interface PasskeyRegistrationResult {
    id: string;
    rawId: string;
    type?: string;
    response: {
        clientDataJSON: string;
        attestationObject: string;
    };
}

/**
 * The FIDO2 Assertion Request
 * https://www.w3.org/TR/webauthn-2/#dictionary-assertion-options
 */
export interface PasskeyAuthenticationRequest {
    challenge: string;
    rpId: string;
    timeout?: number;
    allowCredentials?: Array<PublicKeyCredentialDescriptor>;
    userVerification?: string;
    extensions?: Record<string, unknown>;
}

/**
 * The FIDO2 Assertion Result
 */
export interface PasskeyAuthenticationResult {
    id: string;
    rawId: string;
    type?: string;
    response: {
        authenticatorData: string;
        clientDataJSON: string;
        signature: string;
        userHandle: string;
    };
}

export type AuthenticatorAttachment = 'platform' | 'cross-platform';

export type AuthenticatorTransport =
    | 'usb'
    | 'ble'
    | 'nfc'
    | 'internal'
    | 'hybrid';

export type AuthenticatorType =
    | 'auto'
    | 'local'
    | 'extern'
    | 'roaming'
    | 'both';

export interface CommonOptions {
    userVerification: string;
    authenticatorType: AuthenticatorType;
    timeout: number;
    debug: boolean;
}

export interface CreateOptions extends CommonOptions {
    rp: {
        id: string;
        name: string;
    };
    displayName: string;
    attestation: boolean;
    discoverable: string;
    withSecurityKey: boolean;
}

export interface SignOptions extends CommonOptions {
    rpId: string;
    mediation: 'optional' | 'conditional' | 'required' | 'silent';
    withSecurityKey: boolean;
    /** Don't convert credentials id's to base64url */
    preserveCredentials: boolean;
}
