#!/usr/bin/env node

/**
 * Build script for web deployment.
 * Uses Metro bundler (configured in metro.config.js) to build a React Native Web app.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine public URL from Netlify env or use fallback
const publicUrl = process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || '/';
console.log(`Building for public URL: ${publicUrl}`);

try {
  // Run expo export with the computed public URL
  const cmd = `npx expo export --platform web --output-dir dist --public-url "${publicUrl}"`;
  console.log(`Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
  console.log('✓ Build succeeded');
} catch (error) {
  console.error('✗ Build failed:', error.message);
  process.exit(1);
}
