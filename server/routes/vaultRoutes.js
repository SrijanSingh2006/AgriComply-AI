const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController'); // Check this path!
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
// Debugging: Check if functions exist before assigning route
if (!vaultController.getDocuments || !vaultController.deleteDocument) {
    console.error("CRITICAL ERROR: vaultController functions are undefined. Check exports in vaultController.js");
}
router.get('/', authMiddleware, vaultController.getDocuments);
router.post('/upload', authMiddleware, upload.single('file'), vaultController.uploadDocument);
router.delete('/delete/:id', authMiddleware, vaultController.deleteDocument);
router.put('/replace/:id', authMiddleware, upload.single('file'), vaultController.replaceDocument);
module.exports = router;