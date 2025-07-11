const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const  verifyToken  = require('../middleware/authMiddleware');

router.post('/categories', verifyToken, materialController.createCategory);
router.get('/categories', verifyToken, materialController.getCategories);
router.put('/categories/:id', verifyToken, materialController.updateCategory);
router.delete('/categories/:id', verifyToken, materialController.deleteCategory);

module.exports = router;
