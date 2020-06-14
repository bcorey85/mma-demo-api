const express = require('express');
const router = new express.Router();
const userAuth = require('../../middleware/userAuth');
const {
	logout,
	getUserById,
	seasonSignup,
	updateUserDetails
} = require('../../controllers/user/userControllers');
const {
	createBid,
	updateBid
} = require('../../controllers/user/bidControllers');

router.post('/logout/:userID', userAuth, logout);
router.get('/user/:userID', userAuth, getUserById);
router.put('/user/:userID', userAuth, updateUserDetails);
router.post('/user/:userID/bid', userAuth, createBid);
router.put('/user/:userID/bid', userAuth, updateBid);
router.post('/user/:userID/season/:seasonID/signup', userAuth, seasonSignup);

module.exports = router;
