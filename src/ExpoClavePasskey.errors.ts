export class UnknownError extends Error {
    constructor() {
        super('An unknown error occurred');
        this.name = 'UnknownError';
    }
}

export class NotSupportedError extends Error {
    constructor() {
        super('Passkeys are not supported on this device');
        this.name = 'NotSupportedError';
    }
}

export class RequestFailedError extends Error {
    constructor() {
        super('The request failed, no credentials were returned');
        this.name = 'RequestFailedError';
    }
}

export class UserCancelledError extends Error {
    constructor() {
        super('The user cancelled the request');
        this.name = 'UserCancelledError';
    }
}

export class InvalidChallengeError extends Error {
    constructor() {
        super('The provided challenge was invalid');
        this.name = 'InvalidChallengeError';
    }
}

export class InvalidUserIdError extends Error {
    constructor() {
        super('The provided userId was invalid');
        this.name = 'InvalidUserIdError';
    }
}

export class NotConfiguredError extends Error {
    constructor() {
        super('Your app is not properly configured');
        this.name = 'NotConfiguredError';
    }
}

export class NoCredentialsError extends Error {
    constructor() {
        super('No viable credential is available for the user');
        this.name = 'NoCredentialsError';
    }
}

export class InterruptedError extends Error {
    constructor() {
        super('The operation was interrupted and may be retried');
        this.name = 'InterruptedError';
    }
}

export class NativeError extends Error {
    constructor(message: string) {
        super('An unknown error occurred');
        this.name = 'NativeError';
    }
}

export function handleNativeError(_error: unknown): Error {
    if (typeof _error !== 'object') {
        return new UnknownError();
    }

    const error = String(_error).split(' ')[1];

    switch (error) {
        case 'NotSupported': {
            return new NotSupportedError();
        }
        case 'RequestFailed': {
            return new RequestFailedError();
        }
        case 'UserCancelled': {
            return new UserCancelledError();
        }
        case 'InvalidChallenge': {
            return new InvalidChallengeError();
        }
        case 'NotConfigured': {
            return new NotConfiguredError();
        }
        case 'Interrupted': {
            return new InterruptedError();
        }
        case 'NoCredentials': {
            return new NoCredentialsError();
        }
        case 'UnknownError': {
            return new UnknownError();
        }
        default: {
            return new NativeError(error);
        }
    }
}
