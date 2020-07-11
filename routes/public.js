const express = require('express');
const router = new express.Router();
const {
	pastCards,
	getCard,
	signup,
	login,
	forgotPassword,
	resetPassword
} = require('../controllers/public/');

router.get('/pastcards', pastCards);

router.get('/', getCard);

router.get('/season/:seasonID/card/:cardID', getCard);

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
