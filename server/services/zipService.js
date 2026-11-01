const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Document = require('../models/Document');
const { uploadsDir } = require('../config/storage');

exports.createBundle = async (userId, docTags, outputName, res, options = {}) => {
  // 1. Fetch all file records for this user
  const allDocs = await Document.findByUserId(userId);
  
  // 2. Filter: Only select documents that match the required tags (e.g., 'PAN', 'ITR')
  const requiredTags = Array.isArray(docTags)
    ? new Set(docTags.map(tag => String(tag).toLowerCase().replace(/[^a-z0-9]/g, '')))
    : null;
  let docsToZip = requiredTags
    ? allDocs.filter(doc => requiredTags.has(String(doc.tag || '').toLowerCase().replace(/[^a-z0-9]/g, '')))
    : allDocs;

  if (docsToZip.length === 0) {
    throw new Error("No matching documents found in Vault to zip.");
  }

  docsToZip = docsToZip.filter(doc => {
    const storedFilename = path.basename(String(doc.stored_filename || doc.file_path || '').replace(/\\/g, '/'));
    if (!storedFilename) return false;

    const filePath = path.join(uploadsDir, storedFilename);
    const available = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    if (!available) console.warn('File missing from disk: ' + storedFilename);
    return available;
  });

  if (docsToZip.length === 0) {
    throw new Error("No available files found in Vault to zip.");
  }

  // 3. Set Response Headers: Tell the browser this is a downloadable file
  res.attachment(`${outputName}.zip`);

  // 4. Initialize Archiver
  const archive = archiver('zip', {
    zlib: { level: 9 } // Best compression
  });

  // 5. Pipe the archive data directly to the Express response (stream)
  archive.pipe(res);
  const usedEntryNames = new Set();

  // 6. Append files from local storage to the ZIP
  docsToZip.forEach(doc => {
    // Ensure the file actually exists on disk before adding
    const storedFilename = path.basename(String(doc.stored_filename || doc.file_path || '').replace(/\\/g, '/'));
    const originalFilename = path.basename(String(doc.filename || doc.file_name || storedFilename).replace(/\\/g, '/'));
    const filePath = path.join(uploadsDir, storedFilename);
    if (fs.existsSync(filePath)) {
      const extension = path.extname(originalFilename);
      const desiredName = options.preserveNames
        ? originalFilename
        : `${doc.tag || 'Document'}${extension}`;
      const parsedName = path.parse(desiredName);
      let entryName = desiredName;
      let suffix = 2;
      while (usedEntryNames.has(entryName.toLowerCase())) {
        entryName = `${parsedName.name} (${suffix})${parsedName.ext}`;
        suffix += 1;
      }
      usedEntryNames.add(entryName.toLowerCase());
      archive.file(filePath, { name: entryName });
    } else {
      console.warn(`File missing from disk: ${storedFilename}`);
    }
  });

  // 7. Finalize the archive (This triggers the download on the client side)
  await archive.finalize();
};
