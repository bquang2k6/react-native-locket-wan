// Learn more https://docs.expo.io/guides/customizing-metro
console.log('Loading metro.config.js...');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
