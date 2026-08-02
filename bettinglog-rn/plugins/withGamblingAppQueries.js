// Adds a <queries> entry for every androidPackage in the gambling catalog
// (constants/gamblingApps.ts), so PackageManager can see those packages on
// Android 11+ without the Play-restricted QUERY_ALL_PACKAGES permission.
const { withAndroidManifest } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

// The catalog is TypeScript, which a config plugin can't import, so pull the
// package names out with a regex. Keeps constants/gamblingApps.ts the single
// source of truth.
function readGamblingPackages(projectRoot) {
  const catalogPath = path.join(projectRoot, 'constants', 'gamblingApps.ts');
  const source = fs.readFileSync(catalogPath, 'utf8');
  return [...source.matchAll(/androidPackage:\s*'([^']+)'/g)].map((m) => m[1]);
}

module.exports = function withGamblingAppQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const packages = readGamblingPackages(config.modRequest.projectRoot);

    if (!Array.isArray(manifest.queries)) manifest.queries = [];
    if (manifest.queries.length === 0) manifest.queries.push({});
    const queries = manifest.queries[0];
    if (!Array.isArray(queries.package)) queries.package = [];

    const existing = new Set(queries.package.map((p) => p.$['android:name']));
    for (const pkg of packages) {
      if (!existing.has(pkg)) {
        queries.package.push({ $: { 'android:name': pkg } });
      }
    }
    return config;
  });
};
