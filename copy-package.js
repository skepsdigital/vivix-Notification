const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'package.json');
const destPath = path.join(__dirname, 'dist', 'package.json');

fs.copyFile(sourcePath, destPath, (err) => {
  if (err) {
    console.error('Error copying package.json:', err);
  } 
  else {
    console.log('package.json copied to dist.');
  }
});