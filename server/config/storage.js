const fs = require('fs');
const os = require('os');
const path = require('path');

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const dataRoot = isVercel
  ? path.join(os.tmpdir(), 'agricomply-ai')
  : path.join(__dirname, '..');
const uploadsDir = path.join(dataRoot, 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

module.exports = {
  dataRoot,
  dbPath: path.join(dataRoot, 'agricomply.db'),
  uploadsDir,
  isVercel,
};
