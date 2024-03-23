import ExpoModulesCore
import AuthenticationServices

public class ExpoClavePasskeyModule: Module {
    var passKeyDelegate: PasskeyDelegate?

    public func definition() -> ModuleDefinition {
        Name("ExpoClavePasskey")
        
        /// Register a Passkey
        /// # Parameters
        /// - `challenge`: Challenge to verify passkey (encoded in Base64URL)
        /// - `displayName`: Display Name of Passkey
        /// - `rpId`: Relaying Party ID
        /// - `userId`: User ID (encoded in Base64URL)
        /// - `promise`: Javascript Promise
        AsyncFunction("register") { ( challenge: String,
                                      displayName: String,
                                      rpId: String,
                                      userId: String,
                                      promise: Promise ) in
            
            guard let challenge = Data.fromBase64Url(challenge) else {
                promise.rejectWith(passkeyError: PasskeyError.InvalidChallenge)
                return
            }
            guard let userId = Data.fromBase64Url(userId) else {
                promise.rejectWith(passkeyError: PasskeyError.InvalidUserId)
                return
            }
            
            // Passkey support came with iOS 16
            if #available(iOS 15.0, *) {
                let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
                let authRequest = platformProvider.createCredentialRegistrationRequest(challenge: challenge, name: displayName, userID: userId)
                let authController = ASAuthorizationController(authorizationRequests: [authRequest])
                let passkeyDelegate = PasskeyDelegate2();
                
                // Perform authorization, check for the error and parse the result
                passkeyDelegate.performAuth(for: authController, completion: { error, result in
                    if (error != nil) {
                        promise.rejectWith(passkeyError: self.convertNativeError(error: error!))
                    }
                    
                    // Check if the result object contains a valid registration result
                    if let registrationResult = result?.registrationResult {
                        // Return a NSDictionary instance with the received authorization data
                        let authResult: NSDictionary = [
                            "credentialID": registrationResult.credentialID.toBase64Url(),
                            "response": [
                                "rawAttestationObject": registrationResult.rawAttestationObject.toBase64Url(),
                                "rawClientDataJSON": registrationResult.rawClientDataJSON.toBase64Url(),
                            ]
                        ]
                        promise.resolve(authResult)
                    } else {
                        // If result didn't contain a valid registration result throw an error
                        promise.rejectWith(passkeyError: PasskeyError.RequestFailed)
                    }
                })
            } else {
                promise.rejectWith(passkeyError: PasskeyError.NotSupported)
                return
            }
        }
        
        /// Authenticates a passkey
        /// # Parameters
        /// - `challenge`: Challenge to verify passkey (encoded in Base64URL)
        /// - `allowedCredentials`: Allowed credential IDs (encoded in Base64URL)
        /// - `rpId`: Relaying Party ID
        /// - `promise`: Javascript Promise
        AsyncFunction("authenticate") { (challenge: String,
                                         allowedCredentials: [String],
                                         rpId: String,
                                         promise: Promise) in
            guard let challenge = Data.fromBase64Url(challenge) else {
                promise.rejectWith(passkeyError: PasskeyError.InvalidChallenge)
                return
            }
            
            if #available(iOS 15.0, *) {
                let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
                let authRequest = platformProvider.createCredentialAssertionRequest(challenge: challenge)

                // Try to parse included credentials and add it to the auth request
                do {
                    let credentialDescriptors = try parseCredentials(allowedCredentials)
                    authRequest.allowedCredentials = credentialDescriptors
                } catch let error as PasskeyError {
                    promise.rejectWith(passkeyError: error)
                    return
                }
                let authController = ASAuthorizationController(authorizationRequests: [authRequest])
                let passkeyDelegate = PasskeyDelegate2();
                passkeyDelegate.performAuth(for: authController, completion: { error, result in
                    if (error != nil) {
                        promise.rejectWith(passkeyError: self.convertNativeError(error: error!))
                    }
                    
                    // Check if the result object contains a valid authentication result
                    if let authenticationResult = result?.authenticationResult {
                        let authResult: NSDictionary = [
                            "credentialID": authenticationResult.credentialID.toBase64Url(),
                            "userID": String(decoding: authenticationResult.userID, as: UTF8.self),
                            "response": [
                                "rawAuthenticatorData": authenticationResult.rawAuthenticatorData.toBase64Url(),
                                "rawClientDataJSON": authenticationResult.rawClientDataJSON.toBase64Url(),
                                "signature": authenticationResult.signature.toBase64Url(),
                            ]
                        ]
                        promise.resolve(authResult)
                    } else {
                        promise.rejectWith(passkeyError: PasskeyError.RequestFailed)
                    }
                })
            } else {
                promise.rejectWith(passkeyError: PasskeyError.NotSupported)
                return
            }
        }
    }
    
    /// Converts ASAuthorization error codes to PasskeyError
    func convertNativeError(error: Error) -> PasskeyError {
        let errorCode = (error as NSError).code
        switch errorCode {
        case 1001:
            return PasskeyError.Cancelled
        case 1004:
            return PasskeyError.RequestFailed
        case 4004:
            return PasskeyError.NotConfigured
        default:
            return PasskeyError.UnknownError
        }
    }

    /// Converts Base64URL credentials to Data
    @available(iOS 15, *)
    func parseCredentials(_ credentials: [String]) throws -> [ASAuthorizationPlatformPublicKeyCredentialDescriptor] {
        guard credentials.count > 0 else { return [] }

        var formattedCredentials: [Data] = []
        for credential in credentials {
            guard let data = Data.fromBase64Url(credential) else {
                throw PasskeyError.InvalidChallenge
            }
            formattedCredentials.append(data)
        }

        return formattedCredentials.map { ASAuthorizationPlatformPublicKeyCredentialDescriptor(credentialID: $0) }
    }
}
