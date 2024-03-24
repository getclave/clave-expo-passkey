/** https://w3c.github.io/webauthn/#dictdef-publickeycredentialrpentity */
export type RelyingParty = {
    /** Relying Party ID, can be any string */
    id: string;
    /** Relying Party name, can be any string */
    name: string;
};

/** https://w3c.github.io/webauthn/#dictdef-publickeycredentialuserentity */
export type User = {
    /** User ID, encoded as base64url */
    id: string;
    /** User name, can be any string */
    name: string;
    /** User display name, can be any string. This is what is shown to the user */
    displayName: string;
};

/** https://w3c.github.io/webauthn/#dictdef-publickeycredentialparameters */
export type PublicKeyCredentialParameters = {
    /** @note Credential type is always 'public-key' */
    type: string;
    /**
     * The algorithm used for the credential
     * - `-7`: ES256 (Webauthn's default algorithm)
     * - `-257`: RS256
     */
    alg: number;
};

/** https://w3c.github.io/webauthn/#dictdef-publickeycredentialdescriptor */
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
 * https://w3c.github.io/webauthn/#dictionary-authenticatorSelection
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
     * Whether to use resident keys (aka passkeys). Default is false
     */
    requireResidentKey?: boolean;
    /**
     * Specifies requirements regarding user verification. Default is "preferred".
     * @note For mobile phone authenticators, this is ignored.
     */
    userVerification?: 'preferred' | 'required' | 'discouraged';
};

/** https://w3c.github.io/webauthn/#dictionary-makecredentialoptions */
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

/** https://w3c.github.io/webauthn/#dictdef-authenticationresponsejson */
export type PasskeyCreateResult = {
    /** Credential ID, base64url encoded */
    id: string;
    /** Credential ID, same as `id` */
    rawId: string;
    type: 'webauthn.create';
    response: {
        /** Client data JSON, base64url encoded */
        clientDataJSON: string;
        /** Attestation object, base64url encoded */
        attestationObject: string;
    };
};

/** https://w3c.github.io/webauthn/#dictionary-assertion-options */
export type PasskeyAuthenticationOptions = {
    /** Challenge, base64url encoded */
    challenge: string;
    /** Timeout for the operation, in milliseconds */
    timeout?: number;
    /** Relying party ID */
    rpId?: RelyingParty['id'];
    /** Allowed credentials for the operation */
    allowCredentials?: Array<CredentialDescriptor>;
    /**
     * Specifies requirements regarding user verification. Default is "preferred".
     * @note For mobile phone authenticators, this is ignored.
     */
    userVerification?: 'preferred' | 'required' | 'discouraged';
    /** Hints sent to authenticator, can be ignored */
    hints?: Array<string>;
    /** Extensions sent to authenticator, can be ignored */
    extensions?: Record<string, unknown>;
};

/** https://w3c.github.io/webauthn/#dictdef-authenticatorassertionresponsejson */
export type PasskeyAuthenticationResult = {
    /** Credential ID, base64url encoded */
    id: string;
    /** Credential ID, same as `id` */
    rawId: string;
    type: 'webauthn.get';
    response: {
        /** Authenticator data, base64url encoded */
        authenticatorData: string;
        /** Client data JSON, base64url encoded */
        clientDataJSON: string;
        /** Signature, base64url encoded */
        signature: string;
        /** User handle, base64url encoded */
        userHandle?: string;
    };
};
