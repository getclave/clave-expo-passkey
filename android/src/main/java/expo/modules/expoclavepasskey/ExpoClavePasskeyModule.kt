package expo.modules.expoclavepasskey

import android.content.Context
import expo.modules.core.interfaces.ExpoMethod
import expo.modules.core.ModuleRegistry
import expo.modules.core.ExportedModule
import expo.modules.core.Promise
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import expo.modules.core.interfaces.ActivityProvider
import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.exceptions.*
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException
import expo.modules.core.errors.ModuleDestroyedException

const val REGISTRATION_RESPONSE = "androidx.credentials.BUNDLE_KEY_REGISTRATION_RESPONSE_JSON"
const val AUTH_RESPONSE = "androidx.credentials.BUNDLE_KEY_AUTHENTICATION_RESPONSE_JSON"

class ExpoClavePasskeyModule(context: Context) : ExportedModule(context) {

  private val moduleCoroutineScope = CoroutineScope(Dispatchers.Default)
  private lateinit var moduleRegistry: ModuleRegistry

  override fun onCreate(registry: ModuleRegistry) {
    moduleRegistry = registry
  }

  override fun onDestroy() {
    moduleCoroutineScope.cancel(ModuleDestroyedException())
  }

  override fun getName() = "ExpoClavePasskey"

  private fun getCurrentActivity(): Activity? {
    val activityProvider: ActivityProvider = moduleRegistry.getModule(ActivityProvider::class.java)
    return activityProvider.currentActivity
  }

  @ExpoMethod
  fun register(requestJSON: String, promise: Promise) {
    val credentialManager = CredentialManager.create(context)
    val createPublicKeyCredentialRequest = CreatePublicKeyCredentialRequest(requestJSON)
    val currentActivity = getCurrentActivity()

    moduleCoroutineScope.launch {
      try {
        val result = currentActivity?.let { credentialManager.createCredential(it, createPublicKeyCredentialRequest) }
        val response = result?.data?.getString(REGISTRATION_RESPONSE)
        promise.resolve(response)
      } catch (e: CreateCredentialException) {
        promise.reject("Passkey", handleRegistrationException(e))
      }
    }
  }

  @ExpoMethod
  fun authenticate(requestJSON: String, promise: Promise) {
    val credentialManager = CredentialManager.create(context)
    val getCredentialRequest =
      GetCredentialRequest(listOf(GetPublicKeyCredentialOption(requestJSON)))
    val currentActivity = getCurrentActivity()

    moduleCoroutineScope.launch {
      try {
        val result = currentActivity?.let { credentialManager.getCredential(it, getCredentialRequest) }
        val response = result?.credential?.data?.getString(AUTH_RESPONSE)
        promise.resolve(response)
      } catch (e: GetCredentialException) {
        promise.reject("Passkey", handleAuthenticationException(e))
      }
    }
  }

  private fun handleRegistrationException(e: CreateCredentialException): String {
    when (e) {
      is CreatePublicKeyCredentialDomException -> {
        return e.domError.toString()
      }
      is CreateCredentialCancellationException -> {
        return "UserCancelled"
      }
      is CreateCredentialInterruptedException -> {
        return "Interrupted"
      }
      is CreateCredentialProviderConfigurationException -> {
        return "NotConfigured"
      }
      is CreateCredentialUnknownException -> {
        return "UnknownError"
      }
      is CreateCredentialUnsupportedException -> {
        return "NotSupported"
      }
      else -> {
        return e.toString()
      }
    }
  }

  private fun handleAuthenticationException(e: GetCredentialException): String {
    when (e) {
      is GetPublicKeyCredentialDomException -> {
        return e.domError.toString()
      }
      is GetCredentialCancellationException -> {
        return "UserCancelled"
      }
      is GetCredentialInterruptedException -> {
        return "Interrupted"
      }
      is GetCredentialProviderConfigurationException -> {
        return "NotConfigured"
      }
      is GetCredentialUnknownException -> {
        return "UnknownError"
      }
      is GetCredentialUnsupportedException -> {
        return "NotSupported"
      }
      is NoCredentialException -> {
        return "NoCredentials"
      }
      else -> {
        return e.toString()
      }
    }
  }
}