/**
 * Metro configuration for Expo SDK 54+ (supports web).
 * Ensures correct aliasing and SVG transformer support.
 */

const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// SVG support for Expo SDK 54+
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;