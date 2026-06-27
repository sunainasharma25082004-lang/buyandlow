const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const helmetVendorEntry = require.resolve('react-helmet-async');

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isHelmetVendor =
    moduleName === '../../vendor/react-helmet-async/lib' ||
    moduleName.endsWith('/vendor/react-helmet-async/lib') ||
    moduleName.endsWith('\\vendor\\react-helmet-async\\lib') ||
    moduleName.endsWith('/vendor/react-helmet-async/lib/index') ||
    moduleName.endsWith('\\vendor\\react-helmet-async\\lib\\index');

  if (isHelmetVendor) {
    return {
      filePath: helmetVendorEntry,
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;