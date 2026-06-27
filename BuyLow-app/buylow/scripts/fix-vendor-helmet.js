const fs = require('fs');
const path = require('path');

const vendorDir = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-router',
  'vendor',
  'react-helmet-async',
);

const libShim = path.join(vendorDir, 'lib.js');
const indexFile = path.join(vendorDir, 'lib', 'index.js');

if (!fs.existsSync(indexFile)) {
  console.warn('[fix-vendor-helmet] expo-router vendor helmet not found, skipping');
  process.exit(0);
}

fs.writeFileSync(libShim, "module.exports = require('./lib/index.js');\n");
console.log('[fix-vendor-helmet] Created vendor shim:', libShim);