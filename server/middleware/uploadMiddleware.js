const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // We expect the frontend to send a 'tag' in the body, but multer processes files first.
    // We will use a temporary name here, and the Controller can rename it or 
    // simply rely on the Database to know what the file is.
    // Naming convention: UserID-Date-OriginalName
    const userId = req.user ? req.user.id : 'Guest';
    cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });
module.exports = upload;