#!/usr/bin/env node
/**
 * Build script that injects the API URL into api.ts before building
 * This ensures the correct API endpoint is used in production
 */

const fs = require('fs');
const path = require('path');

const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const apiFilePath = path.join(__dirname, 'src', 'services', 'api.ts');

console.log(`[Build] Injecting API URL: ${apiUrl}`);

// Read the api.ts file
let content = fs.readFileSync(apiFilePath, 'utf-8');

// Replace the hardcoded API_BASE_URL line with the env var value
const oldLine = `const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL as string) || 'http://localhost:8080';`;
const newLine = `const API_BASE_URL = '${apiUrl}'; // Injected at build time`;

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLine);
  fs.writeFileSync(apiFilePath, content, 'utf-8');
  console.log(`[Build] ✓ Updated API_BASE_URL to: ${apiUrl}`);
} else {
  console.warn(`[Build] ⚠ Could not find API_BASE_URL line to replace`);
}

// Now run the actual expo export
const { execSync } = require('child_process');
try {
  console.log('[Build] Running expo export...');
  execSync('npx expo export --platform web --output-dir dist', { stdio: 'inherit' });
  console.log('[Build] ✓ Build complete!');
} catch (error) {
  console.error('[Build] ✗ Expo export failed');
  process.exit(1);
}
