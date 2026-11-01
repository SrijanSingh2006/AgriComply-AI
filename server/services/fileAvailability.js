const fs = require('fs');
const path = require('path');
const { uploadsDir } = require('../config/storage');

const hasStoredFile = (document) => {
  const filename = path.basename(String(document.stored_filename || document.file_path || '').replace(/\\/g, '/'));
  if (!filename) return false;
  try {
    return fs.statSync(path.join(uploadsDir, filename)).isFile();
  } catch {
    return false;
  }
};

module.exports = { hasStoredFile };
