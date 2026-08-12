const express = require('express');
const router = express.Router();
const controller = require('../controllers/trackBController');
const exportController = require('../controllers/exportController'); // <--- Import
const auth = require('../middleware/authMiddleware');

router.get('/schemes', auth, controller.getEligibleSchemes);
// New Route for output
router.get('/download', auth, exportController.downloadLoanPacket);

module.exports = router;