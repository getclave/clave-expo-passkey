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
var delegates = Set<PasskeyDelegate2>();

@available(iOS 15.0, *)
class PasskeyDelegate2: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
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

class PasskeyDelegate: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
  private var _completion: (_ error: Error?, _ result: PasskeyResult?) -> Void;
  
  // Initializes delegate with a completion handler (callback function)
  init(completionHandler: @escaping (_ error: Error?, _ result: PasskeyResult?) -> Void) {
    self._completion = completionHandler;
  }
  
  // Perform the authorization request for a given ASAuthorizationController instance
  @available(iOS 15.0, *)
  @objc(performAuthForController:)
  func performAuthForController(controller: ASAuthorizationController) {
    controller.delegate = self;
    controller.presentationContextProvider = self;
    controller.performRequests();
  }
  
  @available(iOS 13.0, *)
  func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    return UIApplication.shared.keyWindow!;
  }
  
  @available(iOS 13.0, *)
  func authorizationController(
      controller: ASAuthorizationController,
      didCompleteWithError error: Error
  ) {
    // Authorization request returned an error
    self._completion(error, nil);
  }

  @available(iOS 13.0, *)
  func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
    // Check if Passkeys are supported on this OS version
    if #available(iOS 15.0, *) {
      /** We need to determine whether the request was a registration or authentication request and if a security key was used or not*/
      
      // Request was a registration request
      if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration {
        self.handlePlatformPublicKeyRegistrationResponse(credential: credential)
      //Request was an authentication request
      } else if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
        self.handlePlatformPublicKeyAssertionResponse(credential: credential)
      // Request was a registration request with security key
      } else if let credential = authorization.credential as? ASAuthorizationSecurityKeyPublicKeyCredentialRegistration {
        self.handleSecurityKeyPublicKeyRegistrationResponse(credential: credential)
      // Request was an authentication request with security key
      } else if let credential = authorization.credential as? ASAuthorizationSecurityKeyPublicKeyCredentialAssertion {
        self.handleSecurityKeyPublicKeyAssertionResponse(credential: credential)
      } else {
        self._completion(PassKeyError.requestFailed, nil)
      }
    } else {
      // Authorization credential was malformed, throw an error
      self._completion(PassKeyError.notSupported, nil);
    }
  }
  
  @available(iOS 15.0, *)
  func handlePlatformPublicKeyRegistrationResponse(credential: ASAuthorizationPlatformPublicKeyCredentialRegistration) -> Void {
    if let rawAttestationObject = credential.rawAttestationObject {
      // Parse the authorization credential and resolve the callback
      let registrationResult = PassKeyRegistrationResult(credentialID: credential.credentialID,
                                                         rawAttestationObject: rawAttestationObject,
                                                         rawClientDataJSON: credential.rawClientDataJSON);
      self._completion(nil, PassKeyResult(registrationResult: registrationResult));
    } else {
      // Authorization credential was malformed, throw an error
      self._completion(PassKeyError.requestFailed, nil);
    }
  }
  
  @available(iOS 15.0, *)
  func handleSecurityKeyPublicKeyRegistrationResponse(credential: ASAuthorizationSecurityKeyPublicKeyCredentialRegistration) -> Void {
    if let rawAttestationObject = credential.rawAttestationObject {
      // Parse the authorization credential and resolve the callback
      let registrationResult = PassKeyRegistrationResult(credentialID: credential.credentialID,
                                                         rawAttestationObject: rawAttestationObject,
                                                         rawClientDataJSON: credential.rawClientDataJSON);
      self._completion(nil, PassKeyResult(registrationResult: registrationResult));
    } else {
      // Authorization credential was malformed, throw an error
      self._completion(PassKeyError.requestFailed, nil);
    }
  }
  
  @available(iOS 15.0, *)
  func handlePlatformPublicKeyAssertionResponse(credential: ASAuthorizationPlatformPublicKeyCredentialAssertion) -> Void {
    // Parse the authorization credential and resolve the callback
    let assertionResult = PassKeyAssertionResult(credentialID: credential.credentialID,
                                                 rawAuthenticatorData: credential.rawAuthenticatorData,
                                                 rawClientDataJSON: credential.rawClientDataJSON,
                                                 signature: credential.signature,
                                                 userID: credential.userID);
    self._completion(nil, PassKeyResult(assertionResult: assertionResult));
  }
  
  
  @available(iOS 15.0, *)
  func handleSecurityKeyPublicKeyAssertionResponse(credential: ASAuthorizationSecurityKeyPublicKeyCredentialAssertion) -> Void {
    // Parse the authorization credential and resolve the callback
    let assertionResult = PassKeyAssertionResult(credentialID: credential.credentialID,
                                                 rawAuthenticatorData: credential.rawAuthenticatorData,
                                                 rawClientDataJSON: credential.rawClientDataJSON,
                                                 signature: credential.signature,
                                                 userID: credential.userID);
    self._completion(nil, PassKeyResult(assertionResult: assertionResult));
  }
}
