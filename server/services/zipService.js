const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Document = require('../models/Document');
const { uploadsDir } = require('../config/storage');

exports.createBundle = async (userId, docTags, outputName, res) => {
  // 1. Fetch all file records for this user
  const allDocs = await Document.findByUserId(userId);
  
  // 2. Filter: Only select documents that match the required tags (e.g., 'PAN', 'ITR')
  const requiredTags = new Set(docTags.map(tag => String(tag).toLowerCase().replace(/[^a-z0-9]/g, '')));
  const docsToZip = allDocs.filter(doc => requiredTags.has(String(doc.tag || '').toLowerCase().replace(/[^a-z0-9]/g, '')));

  if (docsToZip.length === 0) {
    throw new Error("No matching documents found in Vault to zip.");
  }

  // 3. Set Response Headers: Tell the browser this is a downloadable file
  res.attachment(`${outputName}.zip`);

  // 4. Initialize Archiver
  const archive = archiver('zip', {
    zlib: { level: 9 } // Best compression
  });

  // 5. Pipe the archive data directly to the Express response (stream)
  archive.pipe(res);

  // 6. Append files from local storage to the ZIP
  docsToZip.forEach(doc => {
    // Ensure the file actually exists on disk before adding
    const storedFilename = path.basename(String(doc.stored_filename || doc.file_path || '').replace(/\\/g, '/'));
    const originalFilename = path.basename(String(doc.filename || doc.file_name || storedFilename).replace(/\\/g, '/'));
    const filePath = path.join(uploadsDir, storedFilename);
    if (fs.existsSync(filePath)) {
      // Add file to zip, renaming it to something clean (e.g., "PAN.pdf")
      archive.file(filePath, { name: `${doc.tag}${path.extname(originalFilename)}` });
    } else {
      console.warn(`File missing from disk: ${storedFilename}`);
    }
  });

  // 7. Finalize the archive (This triggers the download on the client side)
  await archive.finalize();
};
