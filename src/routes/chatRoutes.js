const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const  verifyToken  = require('../middleware/authMiddleware');
const { verify } = require('jsonwebtoken');

// Search users to add/send friend requests
router.get('/search-users', verifyToken, chatController.searchUsers);
router.post('/send-request', verifyToken, chatController.sendFriendRequest)
router.get('/friend-requests', verifyToken, chatController.getFriendRequests)
router.put('/friend-requests/respond/:id', verifyToken, chatController.respondToFriendRequest)
router.get('/friends', verifyToken, chatController.getFriends)
module.exports = router;
