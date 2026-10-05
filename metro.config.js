const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Disable unstable package exports resolution to fix React Native 0.86 module resolution
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./src/global.css" });
