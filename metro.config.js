// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NativeWind v4 requires 'nativewind/babel' in your babel.config.js plugins.
// The withNativeWind wrapper in metro.config.js is not needed for NativeWind v4.

module.exports = config;
