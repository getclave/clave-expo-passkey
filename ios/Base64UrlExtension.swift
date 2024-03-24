//
//  Base64UrlExtension.swift
//  ExpoClavePasskey
//
//  Created by Hamza Karabağ on 23.03.2024.
//

import Foundation

/// Converts Base64URL string to Base64
func base64UrlToBase64(_ base64Url: String) -> String {
    var base64 = base64Url
        .replacingOccurrences(of: "-", with: "+")
        .replacingOccurrences(of: "_", with: "/")
    if base64.count % 4 != 0 {
        base64.append(String(repeating: "=", count: 4 - base64.count % 4))
    }
    return base64
}

/// Converts Base64 string to Base64URL
func base64ToBase64Url(_ base64: String) -> String {
    let base64Url = base64
        .replacingOccurrences(of: "+", with: "-")
        .replacingOccurrences(of: "/", with: "_")
        .replacingOccurrences(of: "=", with: "")
    return base64Url
}

/// Extension of Data class for Base64URL conversions
extension Data {
    static func fromBase64Url(_ value: String) -> Data? {
        let base64Value = base64UrlToBase64(value)
        return Data(base64Encoded: base64Value)
    }
    
    func toBase64Url() -> String {
        return base64ToBase64Url(self.base64EncodedString())
    }
}
