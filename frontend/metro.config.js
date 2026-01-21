const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add explicit web platform support
config.resolver.platforms = ['ios', 'android', 'web', 'native'];
config.resolver.assetExts.push('cjs');

module.exports = config;
