//
//  Errors.swift
//  ExpoClavePasskey
//
//  Created by Hamza Karabağ on 23.03.2024.
//

import Foundation
import ExpoModulesCore

struct PasskeyError: Error {
    let code: String
    let message: String
    
    // Common errors with Passkey
    static let NotSupported     = Self(code: "20601", message: "Not supported")
    static let RequestFailed    = Self(code: "20602", message: "Request failed")
    static let Cancelled        = Self(code: "20603", message: "User cancelled")
    static let InvalidChallenge = Self(code: "20604", message: "Invalid challenge")
    static let InvalidRpId      = Self(code: "20605", message: "Invalid rpId")
    static let InvalidUserId    = Self(code: "20606", message: "Invalid userId")
    static let NotConfigured    = Self(code: "20607", message: "Not configured")
    static let UnknownError     = Self(code: "20608", message: "Unknown error")
}

/// Extension of Promise that has rejection with Passkey Error
extension Promise {
    func rejectWith(passkeyError: PasskeyError) {
        self.reject(passkeyError.code, passkeyError.message)
    }
}
