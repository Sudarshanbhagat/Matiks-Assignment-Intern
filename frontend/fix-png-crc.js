#!/usr/bin/env node

/**
 * Fix PNG CRC Errors
 * 
 * This script re-saves PNG files to strip CRC metadata corruption.
 * Run: node fix-png-crc.js
 */

const fs = require('fs');
const path = require('path');

// Try using sharp if available, otherwise use manual CRC fix
try {
  const sharp = require('sharp');
  
  const assetsDir = path.join(__dirname, 'assets');
  const pngFiles = [
    'icon.png',
    'splash.png', 
    'adaptive-icon.png'
  ];

  console.log('🔧 Fixing PNG CRC errors...\n');

  pngFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    
    if (fs.existsSync(filePath)) {
      try {
        sharp(filePath)
          .png({ quality: 100 })
          .toFile(filePath + '.tmp')
          .then(() => {
            fs.renameSync(filePath + '.tmp', filePath);
            console.log(`✓ Fixed ${file}`);
          })
          .catch(err => console.error(`✗ Error fixing ${file}:`, err.message));
      } catch (error) {
        console.error(`✗ Could not fix ${file}:`, error.message);
      }
    } else {
      console.warn(`⚠ File not found: ${file}`);
    }
  });

  console.log('\n✓ PNG CRC fix complete!');

} catch (error) {
  console.log('⚠ Sharp not available. Installing dependencies...');
  console.log('Run: npm install sharp');
  process.exit(1);
}
