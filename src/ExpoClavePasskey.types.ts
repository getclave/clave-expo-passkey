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
