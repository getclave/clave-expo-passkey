//
//  PasskeyDelegate.swift
//  ClaveExpoPasskey
//
//  Created by Hamza Karabağ on 21.01.2024.
//

import Foundation
import AuthenticationServices

struct PasskeyRegistrationResult {
    var credentialID: Data
    var rawAttestationObject: Data
    var rawClientDataJSON: Data
}

struct PasskeyAuthenticationResult {
    var credentialID: Data
    var rawAuthenticatorData: Data
    var rawClientDataJSON: Data
    var signature: Data
    var userID: Data
}

struct PasskeyResult {
    var registrationResult: PasskeyRegistrationResult?
    var authenticationResult: PasskeyAuthenticationResult?
}

typealias PasskeyCallback = (_ error: Error?, _ result: PasskeyResult?) -> Void;

@available(iOS 15.0, *)
var delegates = Set<PasskeyDelegate>();

@available(iOS 15.0, *)
class PasskeyDelegate: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private var completion: PasskeyCallback?;
    
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        guard let keyWindow = UIApplication.shared.windows.first(where: \.isKeyWindow) else {
            fatalError("No key window found")
        }
        return keyWindow
    }
    
    func performAuth(for controller: ASAuthorizationController, completion: @escaping PasskeyCallback) {
        self.completion = completion;
        
        // Set delegate for the controller and add self to existing delegates
        controller.delegate = self;
        delegates.insert(self);
        
        controller.presentationContextProvider = self;
        controller.performRequests();
    }
    
    // On authorization success
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        // Check if authorization was passkey registration or passkey authentication
        if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration {
            // Registration
            self.onRegister(credential: credential)
        } else if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
            // Authentication
            self.onAuthenticate(credential: credential)
        } else {
            self.completion!(PasskeyError.RequestFailed, nil)
        }
        
        // Clear completion function and remove delegate
        self.completion = nil
        delegates.remove(self)
    }

    // On authorization failure
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        self.completion!(error, nil)
        self.completion = nil
        delegates.remove(self)
    }
    
    func onRegister(credential: ASAuthorizationPlatformPublicKeyCredentialRegistration) -> Void {
      if let rawAttestationObject = credential.rawAttestationObject {
        // Parse the authorization credential and resolve the callback
        let registrationResult = PasskeyRegistrationResult(credentialID: credential.credentialID,
                                                           rawAttestationObject: rawAttestationObject,
                                                           rawClientDataJSON: credential.rawClientDataJSON);
        self.completion!(nil, PasskeyResult(registrationResult: registrationResult));
      } else {
        // Authorization credential was malformed, throw an error
        self.completion!(PasskeyError.RequestFailed, nil);
      }
    }
    
    func onAuthenticate(credential: ASAuthorizationPlatformPublicKeyCredentialAssertion) -> Void {
      // Parse the authorization credential and resolve the callback
      let authenticationResult = PasskeyAuthenticationResult(credentialID: credential.credentialID,
                                                             rawAuthenticatorData: credential.rawAuthenticatorData,
                                                             rawClientDataJSON: credential.rawClientDataJSON,
                                                             signature: credential.signature,
                                                             userID: credential.userID);
      self.completion!(nil, PasskeyResult(authenticationResult: authenticationResult));
    }
    
}
