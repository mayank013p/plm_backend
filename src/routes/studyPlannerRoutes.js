const express = require('express');
const router = express.Router();
const studyPlannerController = require('../controllers/studyPlannerController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/events', verifyToken, studyPlannerController.getStudyPlannerEvents);
router.post('/events', verifyToken, studyPlannerController.createStudyPlannerEvent)
router.put('/events/:id', verifyToken, studyPlannerController.updateStudyPlannerEvent)
router.delete('/event/:id', verifyToken, studyPlannerController.deleteEvent);


module.exports = router;