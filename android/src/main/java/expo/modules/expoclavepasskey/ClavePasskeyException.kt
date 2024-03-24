package expo.modules.expoclavepasskey

import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.CreateCredentialInterruptedException
import androidx.credentials.exceptions.CreateCredentialProviderConfigurationException
import androidx.credentials.exceptions.CreateCredentialUnknownException
import androidx.credentials.exceptions.CreateCredentialUnsupportedException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.GetCredentialInterruptedException
import androidx.credentials.exceptions.GetCredentialProviderConfigurationException
import androidx.credentials.exceptions.GetCredentialUnknownException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.NoCredentialException
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException

/**
 * Class to represent passkey errors
 * @param code Error code
 * @param message Error message, it mustn't contain whitespace
 */
class ClavePasskeyException(val code: String, val message: String) { }

/**
 * Converts registration exception to error code and error message
 * @param e Exception
 */
fun convertRegistrationException(e: CreateCredentialException): ClavePasskeyException {
    when (e) {
        is CreatePublicKeyCredentialDomException -> {
            return ClavePasskeyException("10601", e.domError.toString())
        }
        is CreateCredentialCancellationException -> {
            return ClavePasskeyException("10602", "UserCancelled")
        }
        is CreateCredentialInterruptedException -> {
            return ClavePasskeyException("10603", "Interrupted")
        }
        is CreateCredentialProviderConfigurationException -> {
            return ClavePasskeyException("10604", "NotConfigured")
        }
        is CreateCredentialUnknownException -> {
            return ClavePasskeyException("10605", "UnknownError")
        }
        is CreateCredentialUnsupportedException -> {
            return ClavePasskeyException("10606", "NotSupported")
        }
        else -> {
            return ClavePasskeyException("10608", e.toString())
        }
    }
}

/**
 * Converts authentication exception to error code and error message
 * @param e Exception
 */
fun convertAuthenticationException(e: GetCredentialException): ClavePasskeyException {
    when (e) {
        is GetPublicKeyCredentialDomException -> {
            return ClavePasskeyException("10601", e.domError.toString())
        }
        is GetCredentialCancellationException -> {
            return ClavePasskeyException("10602", "UserCancelled")
        }
        is GetCredentialInterruptedException -> {
            return ClavePasskeyException("10603", "Interrupted")
        }
        is GetCredentialProviderConfigurationException -> {
            return ClavePasskeyException("10604", "NotConfigured")
        }
        is GetCredentialUnknownException -> {
            return ClavePasskeyException("10605", "UnknownError")
        }
        is GetCredentialUnsupportedException -> {
            return ClavePasskeyException("10606", "NotSupported")
        }
        is NoCredentialException -> {
            return ClavePasskeyException("10607", "NoCredentials")
        }
        else -> {
            return ClavePasskeyException("10608", e.toString())
        }
    }
}