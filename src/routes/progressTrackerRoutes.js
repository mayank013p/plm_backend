const express = require('express');
const router = express.Router();
const progressTrackerController = require('../controllers/progressTrackerController');
const  verifyToken  = require('../middleware/authMiddleware');

router.post('/goals', verifyToken, progressTrackerController.createGoal);
router.get('/goals', verifyToken, progressTrackerController.getGoals);
router.put('/goals/:id', verifyToken, progressTrackerController.updateGoal);
router.delete('/goals/:id', verifyToken, progressTrackerController.deleteGoal);

module.exports = router;
