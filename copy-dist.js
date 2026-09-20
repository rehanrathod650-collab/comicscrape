const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, 'client/dist');
const dest = path.resolve(__dirname, 'dist');

if (fs.existsSync(src)) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.cpSync(src, dest, { recursive: true });
  console.log('⚡ Successfully copied client/dist to root dist/ for Vercel deployment');
} else {
  console.error('❌ client/dist does not exist!');
  process.exit(1);
}
