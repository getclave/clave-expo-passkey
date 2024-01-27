import ExpoModulesCore
import AuthenticationServices

public class ExpoClavePasskeyModule: Module {
    var passKeyDelegate: PasskeyDelegate?

    public func definition() -> ModuleDefinition {
        Name("ExpoClavePasskey")

        AsyncFunction("register") { ( identifier: String,
                                      challenge: String,
                                      displayName: String,
                                      userId: String,
                                      excludedCredentials: [String],
                                      securityKey: Bool,
                                      promise: Promise ) in

            // Convert challenge and userId to correct type
            guard let challengeData = Data(base64Encoded: challenge) else {
                promise.reject( PassKeyError.invalidChallenge.rawValue,
                                PassKeyError.invalidChallenge.rawValue )
                return
            }
            let userIdData: Data = RCTConvert.nsData(userId)

            // Check if Passkeys are supported on this OS version
            if #available(iOS 15.0, *) {
                let authController: ASAuthorizationController

                // Check if registration should proceed with a security key
                if securityKey {
                    // Create a new registration request with security key
                    let securityKeyProvider = ASAuthorizationSecurityKeyPublicKeyCredentialProvider(
                        relyingPartyIdentifier: identifier)
                    let authRequest = securityKeyProvider.createCredentialRegistrationRequest(
                        challenge: challengeData, displayName: displayName, name: displayName, userID: userIdData)
                    authRequest.credentialParameters = [
                        ASAuthorizationPublicKeyCredentialParameters(algorithm: ASCOSEAlgorithmIdentifier.ES256),
                    ]
                    authController = ASAuthorizationController(authorizationRequests: [authRequest])
                } else {
                    // Create a new registration request without security key
                    let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
                        relyingPartyIdentifier: identifier)
                    let authRequest = platformProvider.createCredentialRegistrationRequest(
                        challenge: challengeData, name: displayName, userID: userIdData)

                    // Try to parse excluded credentials and add it to the auth request
                    do {
                        let credentialDescriptors = try parseCredentials(excludedCredentials)
                        authRequest.excludedCredentials = credentialDescriptors
                    } catch let error as PassKeyError {
                        promise.reject(error.rawValue, error.rawValue)
                        return
                    }
                    authController = ASAuthorizationController(authorizationRequests: [authRequest])
                }

                // Set up a PasskeyDelegate instance with a callback function
                self.passKeyDelegate = PasskeyDelegate { error, result in
                    // Check if authorization process returned an error and throw if thats the case
                    if error != nil {
                        let passkeyError = self.handleErrorCode(error: error!)
                        promise.reject(passkeyError.rawValue, passkeyError.rawValue)
                        return
                    }

                    // Check if the result object contains a valid registration result
                    if let registrationResult = result?.registrationResult {
                        // Return a NSDictionary instance with the received authorization data
                        let authResponse: NSDictionary = [
                            "rawAttestationObject": registrationResult.rawAttestationObject.base64EncodedString(),
                            "rawClientDataJSON": registrationResult.rawClientDataJSON.base64EncodedString(),
                        ]

                        let authResult: NSDictionary = [
                            "credentialID": registrationResult.credentialID.base64EncodedString(),
                            "response": authResponse,
                        ]
                        promise.resolve(authResult)
                    } else {
                        // If result didn't contain a valid registration result throw an error
                        promise.reject( PassKeyError.requestFailed.rawValue,
                                        PassKeyError.requestFailed.rawValue )
                    }
                }

                if let passKeyDelegate = self.passKeyDelegate {
                    // Perform the authorization request
                    passKeyDelegate.performAuthForController(controller: authController)
                }
            } else {
                // If Passkeys are not supported throw an error
                promise.reject( PassKeyError.notSupported.rawValue,
                                PassKeyError.notSupported.rawValue )
            }
        }

        AsyncFunction("authenticate") { ( identifier: String,
                                          challenge: String,
                                          allowedCredentials: [String],
                                          securityKey: Bool,
                                          promise: Promise ) in
            // Convert challenge to correct type
            guard let challengeData = Data(base64Encoded: challenge) else {
                promise.reject( PassKeyError.invalidChallenge.rawValue,
                                PassKeyError.invalidChallenge.rawValue )
                return
            }

            // Check if Passkeys are supported on this OS version
            if #available(iOS 15.0, *) {
                let authController: ASAuthorizationController

                // Check if authentication should proceed with a security key
                if securityKey {
                    // Create a new assertion request with security key
                    let securityKeyProvider = ASAuthorizationSecurityKeyPublicKeyCredentialProvider(
                        relyingPartyIdentifier: identifier)
                    let authRequest = securityKeyProvider.createCredentialAssertionRequest(
                        challenge: challengeData)
                    authController = ASAuthorizationController(authorizationRequests: [authRequest])
                } else {
                    // Create a new assertion request without security key
                    let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(
                        relyingPartyIdentifier: identifier)
                    let authRequest = platformProvider.createCredentialAssertionRequest(
                        challenge: challengeData)

                    // Try to parse included credentials and add it to the auth request
                    do {
                        let credentialDescriptors = try parseCredentials(allowedCredentials)
                        authRequest.allowedCredentials = credentialDescriptors
                    } catch let error as PassKeyError {
                        promise.reject(error.rawValue, error.rawValue)
                        return
                    }
                    authController = ASAuthorizationController(authorizationRequests: [authRequest])
                }

                // Set up a PasskeyDelegate instance with a callback function
                self.passKeyDelegate = PasskeyDelegate { error, result in
                    // Check if authorization process returned an error and throw if thats the case
                    if error != nil {
                        let passkeyError = self.handleErrorCode(error: error!)
                        promise.reject(passkeyError.rawValue, passkeyError.rawValue)
                        return
                    }
                    // Check if the result object contains a valid authentication result
                    if let assertionResult = result?.assertionResult {
                        // Return a NSDictionary instance with the received authorization data
                        let authResponse: NSDictionary = [
                            "rawAuthenticatorData": assertionResult.rawAuthenticatorData.base64EncodedString(),
                            "rawClientDataJSON": assertionResult.rawClientDataJSON.base64EncodedString(),
                            "signature": assertionResult.signature.base64EncodedString(),
                        ]

                        let authResult: NSDictionary = [
                            "credentialID": assertionResult.credentialID.base64EncodedString(),
                            "userID": String(decoding: assertionResult.userID, as: UTF8.self),
                            "response": authResponse,
                        ]
                        promise.resolve(authResult)
                    } else {
                        // If result didn't contain a valid authentication result throw an error
                        promise.reject( PassKeyError.requestFailed.rawValue,
                                        PassKeyError.requestFailed.rawValue )
                    }
                }

                if let passKeyDelegate = self.passKeyDelegate {
                    // Perform the authorization request
                    passKeyDelegate.performAuthForController(controller: authController)
                }
            } else {
                // If Passkeys are not supported throw an error
                promise.reject( PassKeyError.notSupported.rawValue,
                                PassKeyError.notSupported.rawValue )
            }

        }
    }

    // Handles ASAuthorization error codes
    func handleErrorCode(error: Error) -> PassKeyError {
        let errorCode = (error as NSError).code
        switch errorCode {
        case 1001:
            return PassKeyError.cancelled
        case 1004:
            return PassKeyError.requestFailed
        case 4004:
            return PassKeyError.notConfigured
        default:
            return PassKeyError.unknown
        }
    }

    @available(iOS 15, *)
    func parseCredentials(_ credentials: [String]) throws -> [ASAuthorizationPlatformPublicKeyCredentialDescriptor] {
        guard credentials.count > 0 else { return [] }

        var formattedCredentials: [Data] = []
        for credential in credentials {
            guard let data = Data(base64Encoded: credential) else {
                throw PassKeyError.invalidChallenge
            }
            formattedCredentials.append(data)
        }

        return formattedCredentials.map { ASAuthorizationPlatformPublicKeyCredentialDescriptor(credentialID: $0) }
    }
}

//
// Passkey related types
//

enum PassKeyError: String, Error {
    case notSupported = "NotSupported"
    case requestFailed = "RequestFailed"
    case cancelled = "UserCancelled"
    case invalidChallenge = "InvalidChallenge"
    case notConfigured = "NotConfigured"
    case unknown = "UnknownError"
}

struct AuthRegistrationResult {
    var passkey: PassKeyRegistrationResult
    var type: PasskeyOperation
}

struct AuthAssertionResult {
    var passkey: PassKeyAssertionResult
    var type: PasskeyOperation
}

struct PassKeyResult {
    var registrationResult: PassKeyRegistrationResult?
    var assertionResult: PassKeyAssertionResult?
}

struct PassKeyRegistrationResult {
    var credentialID: Data
    var rawAttestationObject: Data
    var rawClientDataJSON: Data
}

struct PassKeyAssertionResult {
    var credentialID: Data
    var rawAuthenticatorData: Data
    var rawClientDataJSON: Data
    var signature: Data
    var userID: Data
}

enum PasskeyOperation {
    case Registration
    case Assertion
}
