const express = require('express');
const cardControllers = require('../../controllers/admin/card');
const adminAuth = require('../../middleware/adminAuth');
const router = new express.Router();

//Create card - save to DB
router.post(
	'/admin/season/:seasonID/card',
	adminAuth,
	cardControllers.createCard
);

//Get card by id
router.get(
	'/admin/season/:seasonID/card/:cardID',
	adminAuth,
	cardControllers.getCardById
);

//Update card in DB - Fights meta & point adjustments
router.put(
	'/admin/season/:seasonID/card/:cardID/',
	adminAuth,
	cardControllers.updateCard
);

//Delete card from DB
router.delete(
	'/admin/season/:seasonID/card/:cardID',
	cardControllers.deleteCard
);

module.exports = router;
