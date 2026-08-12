const express = require('express');
const router = express.Router();
const controller = require('../controllers/trackAController');
const exportController = require('../controllers/exportController'); // <--- Import
const auth = require('../middleware/authMiddleware');

router.get('/status', auth, controller.getComplianceStatus);
// New Route for output
router.get('/download', auth, exportController.downloadComplianceBundle); 

module.exports = router;