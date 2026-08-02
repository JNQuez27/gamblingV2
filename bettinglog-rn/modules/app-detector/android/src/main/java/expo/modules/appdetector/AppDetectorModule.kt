package expo.modules.appdetector

import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Answers "which of these package names are installed?" via PackageManager.
// Only packages declared in the app manifest's <queries> block are visible on
// Android 11+ (package-visibility rules) — the config plugin keeps that block
// in sync with the gambling catalog, so no QUERY_ALL_PACKAGES is needed.
class AppDetectorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppDetector")

    Function("getInstalledPackages") { candidates: List<String> ->
      val packageManager = appContext.reactContext?.packageManager
        ?: return@Function emptyList<String>()
      candidates.filter { packageName ->
        try {
          packageManager.getPackageInfo(packageName, 0)
          true
        } catch (e: PackageManager.NameNotFoundException) {
          false
        }
      }
    }
  }
}
