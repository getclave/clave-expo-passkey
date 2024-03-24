//
//  Errors.swift
//  ExpoClavePasskey
//
//  Created by Hamza Karabağ on 23.03.2024.
//

import Foundation
import ExpoModulesCore

/// Struct to represent Passkey errors.
struct PasskeyError: Error {
    // Error code
    let code: String
    // Error message, it mustn't containt whitespace
    let message: String
    
    // Common errors with Passkey
    static let NotSupported     = Self(code: "20601", message: "NotSupported")
    static let RequestFailed    = Self(code: "20602", message: "RequestFailed")
    static let Cancelled        = Self(code: "20603", message: "UserCancelled")
    static let InvalidChallenge = Self(code: "20604", message: "InvalidChallenge")
    static let InvalidRpId      = Self(code: "20605", message: "InvalidRpId")
    static let InvalidUserId    = Self(code: "20606", message: "InvalidUserId")
    static let NotConfigured    = Self(code: "20607", message: "NotConfigured")
    static let UnknownError     = Self(code: "20608", message: "UnknownError")
}

/// Extension of Promise that has rejection with Passkey Error
extension Promise {
    func rejectWith(passkeyError: PasskeyError) {
        self.reject(passkeyError.code, passkeyError.message)
    }
}
