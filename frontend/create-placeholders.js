#!/usr/bin/env node

/**
 * Create Placeholder PNG Images
 * 
 * Replaces corrupted PNG files with clean, simple SVG-based placeholders.
 * Run: node create-placeholders.js
 */

const fs = require('fs');
const path = require('path');

// Minimal valid PNG (1x1 transparent pixel)
// This is a safe, minimal PNG that won't cause CRC errors
const createTransparentPNG = () => {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, // color type & CRC
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, // data & CRC
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, // IEND chunk
    0x42, 0x60, 0x82
  ]);
};

const assetsDir = path.join(__dirname, 'assets');

const files = {
  'icon.png': createTransparentPNG(),
  'splash.png': createTransparentPNG(),
  'adaptive-icon.png': createTransparentPNG(),
};

console.log('🖼️  Creating placeholder PNG images...\n');

Object.entries(files).forEach(([filename, buffer]) => {
  const filepath = path.join(assetsDir, filename);
  try {
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Created ${filename} (${buffer.length} bytes)`);
  } catch (error) {
    console.error(`✗ Error creating ${filename}:`, error.message);
  }
});

console.log('\n✓ Placeholder images created!');
console.log('Note: These are minimal valid PNGs. Replace with real assets later.');
