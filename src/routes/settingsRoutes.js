const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const verifyToken = require('../middleware/authMiddleware');


router.get('/profile', verifyToken, settingsController.getProfile);
router.put('/profile', verifyToken, settingsController.updateProfile);
router.get('/user-settings', settingsController.getAllUserSettings);
router.put('/user-settings', verifyToken, settingsController.updateUserSettings);

module.exports = router;
