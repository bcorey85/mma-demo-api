const express = require('express');
const router = new express.Router();
const userAuth = require('../../middleware/userAuth');
const {
	getUserById,
	seasonSignup,
	updateUserDetails
} = require('../../controllers/user/user/');
const { createBid, updateBid } = require('../../controllers/user/bid');

router.get('/user/:userID', userAuth, getUserById);
router.put('/user/:userID', userAuth, updateUserDetails);
router.post('/user/:userID/bid', userAuth, createBid);
router.put('/user/:userID/bid', userAuth, updateBid);
router.post('/user/:userID/season/:seasonID/signup', userAuth, seasonSignup);

module.exports = router;
