const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Document = require('../models/Document');

exports.createBundle = async (userId, docTags, outputName, res) => {
  // 1. Fetch all file records for this user
  const allDocs = await Document.findByUserId(userId);
  
  // 2. Filter: Only select documents that match the required tags (e.g., 'PAN', 'ITR')
  const docsToZip = allDocs.filter(doc => docTags.includes(doc.tag));

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
    if (fs.existsSync(doc.file_path)) {
      // Add file to zip, renaming it to something clean (e.g., "PAN.pdf")
      archive.file(doc.file_path, { name: `${doc.tag}${path.extname(doc.file_name)}` });
    } else {
      console.warn(`File missing from disk: ${doc.file_path}`);
    }
  });

  // 7. Finalize the archive (This triggers the download on the client side)
  await archive.finalize();
};