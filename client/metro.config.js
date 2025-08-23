const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
// const path = require("path");

// Get the default Expo config
const config = getDefaultConfig(__dirname);

// Modify the config to support SVG files
config.transformer.babelTransformerPath = require.resolve(
    "react-native-svg-transformer"
);

const assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
const sourceExts = [...config.resolver.sourceExts, "svg"];

config.resolver.assetExts = assetExts;
config.resolver.sourceExts = sourceExts;

module.exports = withNativeWind(config, { input: "./app/globals.css" });