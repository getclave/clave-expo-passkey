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
    return moduleRegistry.getModule(ActivityProvider::class.java).currentActivity
  }

  @ExpoMethod
  fun register(requestJSON: String, promise: Promise) {
    // Android API works with JSON strings for Webauthn interaction
    // requestJSON must be validated on the Javascript library level
    val credentialManager = CredentialManager.create(context)
    val createPublicKeyCredentialRequest = CreatePublicKeyCredentialRequest(requestJSON)
    val currentActivity = getCurrentActivity()

    moduleCoroutineScope.launch {
      try {
        val result = currentActivity?.let {
          credentialManager.createCredential(
            it,
            createPublicKeyCredentialRequest
          )
        }
        val response = result?.data?.getString(REGISTRATION_RESPONSE)
        promise.resolve(response)
      } catch (e: CreateCredentialException) {
        val claveError = convertRegistrationException(e)
        promise.reject(claveError.code, claveError.message)
      }
    }
  }

  @ExpoMethod
  fun authenticate(requestJSON: String, promise: Promise) {
    // Android API works with JSON strings for Webauthn interaction
    // requestJSON must be validated on the Javascript library level
    val credentialManager = CredentialManager.create(context)
    val getCredentialRequest =
      GetCredentialRequest(listOf(GetPublicKeyCredentialOption(requestJSON)))
    val currentActivity = getCurrentActivity()

    moduleCoroutineScope.launch {
      try {
        val result =
          currentActivity?.let { credentialManager.getCredential(it, getCredentialRequest) }
        val response = result?.credential?.data?.getString(AUTH_RESPONSE)
        promise.resolve(response)
      } catch (e: GetCredentialException) {
        val claveError = convertAuthenticationException(e)
        promise.reject(claveError.code, claveError.message)
      }
    }
  }
}