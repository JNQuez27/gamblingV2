package expo.modules.gamblingmonitor

import android.app.Activity
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.VpnService
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// JS-facing half of the background gambling monitor (Mechanisms 2 & 3). Exposes
// the seam expected by src/services/gamblingDetection.service.ts:
//   startMonitoring() / stopMonitoring() / requestPermissions(): Promise<boolean>
//     — the app-open monitor (UsageStatsManager foreground service, Mechanism 2)
//   requestVpnConsent() / startWebsiteShield() / stopWebsiteShield()
//     — the website shield (local DNS VpnService, Mechanism 3)
// plus setWatchlist / setBlocklist so the TS catalog stays the single source of
// truth. Emits 'GamblingAppDetected' { package } and 'GamblingSiteDetected' { url }.
class GamblingMonitorModule : Module() {

  // requestPermissions() parks its promise here while the user is away in the
  // Usage Access settings screen; resolved when the app returns to foreground.
  private var pendingPermissionPromise: Promise? = null
  // requestVpnConsent() parks its promise here across the system VPN dialog.
  private var pendingVpnPromise: Promise? = null

  private val vpnRequestCode = 0x5650 // "VP"

  override fun definition() = ModuleDefinition {
    Name("GamblingMonitor")

    Events("GamblingAppDetected", "GamblingSiteDetected")

    OnCreate {
      GamblingMonitorService.onGamblingAppDetected = { pkg ->
        sendEvent("GamblingAppDetected", mapOf("package" to pkg))
      }
      GamblingVpnService.onGamblingSiteDetected = { host ->
        sendEvent("GamblingSiteDetected", mapOf("url" to host))
      }
    }

    OnDestroy {
      GamblingMonitorService.onGamblingAppDetected = null
      GamblingVpnService.onGamblingSiteDetected = null
    }

    // Persist the gambling package list (from constants/gamblingApps.ts) so
    // the service — including a system restart of it (START_STICKY) — knows
    // what to watch without JS being alive.
    Function("setWatchlist") { packages: List<String> ->
      val context = appContext.reactContext
      if (context != null) {
        context.getSharedPreferences(GamblingMonitorService.PREFS, Context.MODE_PRIVATE)
          .edit()
          .putStringSet(GamblingMonitorService.KEY_WATCHLIST, packages.toSet())
          .apply()
      }
    }

    Function("startMonitoring") {
      val context = appContext.reactContext
      // Without Usage Access the service would poll blind — don't start it.
      if (context != null && hasUsageAccess(context)) {
        val intent = Intent(context, GamblingMonitorService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
      }
    }

    Function("stopMonitoring") {
      val context = appContext.reactContext
      context?.stopService(Intent(context, GamblingMonitorService::class.java))
    }

    // ── Website shield (Mechanism 3 — local DNS VPN) ────────────────

    // Persist the gambling domain list + block/detect mode the VPN inspects.
    // Call before startWebsiteShield(); survives a service restart.
    Function("setBlocklist") { domains: List<String>, block: Boolean ->
      val context = appContext.reactContext
      if (context != null) {
        context.getSharedPreferences(GamblingVpnService.PREFS, Context.MODE_PRIVATE)
          .edit()
          .putStringSet(GamblingVpnService.KEY_DOMAINS, domains.toSet())
          .putBoolean(GamblingVpnService.KEY_BLOCK_MODE, block)
          .apply()
      }
    }

    // Shows the Android system VPN consent dialog if needed (VpnService.prepare),
    // and resolves to whether VPN consent is granted. The VPN is intrusive, so
    // this is a DISTINCT consent from Usage Access.
    AsyncFunction("requestVpnConsent") { promise: Promise ->
      val context = appContext.reactContext
      val activity = appContext.currentActivity
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      val consentIntent = try {
        VpnService.prepare(context)
      } catch (e: Exception) {
        // Thrown when an always-on VPN owned by another app blocks preparation.
        promise.resolve(false)
        return@AsyncFunction
      }
      if (consentIntent == null) {
        promise.resolve(true) // already granted
        return@AsyncFunction
      }
      if (activity == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      pendingVpnPromise = promise
      try {
        activity.startActivityForResult(consentIntent, vpnRequestCode)
      } catch (e: Exception) {
        pendingVpnPromise = null
        promise.resolve(false)
      }
    }

    // Start the DNS-inspecting VPN in the given mode. No-op (returns false) if
    // consent isn't granted yet — call requestVpnConsent() first.
    Function("startWebsiteShield") { block: Boolean ->
      val context = appContext.reactContext ?: return@Function false
      context.getSharedPreferences(GamblingVpnService.PREFS, Context.MODE_PRIVATE)
        .edit()
        .putBoolean(GamblingVpnService.KEY_BLOCK_MODE, block)
        .apply()
      if (VpnService.prepare(context) != null) return@Function false // needs consent
      val intent = Intent(context, GamblingVpnService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
      true
    }

    Function("stopWebsiteShield") {
      val context = appContext.reactContext
      context?.stopService(Intent(context, GamblingVpnService::class.java))
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode == vpnRequestCode) {
        pendingVpnPromise?.let { promise ->
          pendingVpnPromise = null
          promise.resolve(payload.resultCode == Activity.RESULT_OK)
        }
      }
    }

    // Deep-links to Settings → Usage Access (PACKAGE_USAGE_STATS is a special
    // permission that only the user can grant there), then resolves with the
    // granted state once the user comes back to the app.
    AsyncFunction("requestPermissions") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      if (hasUsageAccess(context)) {
        promise.resolve(true)
        return@AsyncFunction
      }
      pendingPermissionPromise = promise
      try {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
      } catch (e: Exception) {
        // No settings screen on this device — report not granted.
        pendingPermissionPromise = null
        promise.resolve(false)
      }
    }

    OnActivityEntersForeground {
      pendingPermissionPromise?.let { promise ->
        pendingPermissionPromise = null
        val context = appContext.reactContext
        promise.resolve(context != null && hasUsageAccess(context))
      }
    }
  }

  private fun hasUsageAccess(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName,
      )
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName,
      )
    }
    // Some OEMs report MODE_DEFAULT and defer to the manifest permission.
    return when (mode) {
      AppOpsManager.MODE_ALLOWED -> true
      AppOpsManager.MODE_DEFAULT ->
        context.checkCallingOrSelfPermission(android.Manifest.permission.PACKAGE_USAGE_STATS) ==
          PackageManager.PERMISSION_GRANTED
      else -> false
    }
  }
}
