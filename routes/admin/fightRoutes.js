const express = require('express');
const router = new express.Router();
const adminAuth = require('../../middleware/adminAuth');
const fightControllers = require('../../controllers/admin/fightControllers');

//Get player list
router.get(
	'/admin/season/:seasonID/card/:cardID/fight/:fightID/',
	adminAuth,
	fightControllers.getPlayerListByCardId
);

//Get existing bids
router.get(
	'/admin/season/:seasonID/card/:cardID/fight/:fightID/edit',
	adminAuth,
	fightControllers.getBidsByFightId
);

//Edit bids - save to DB
router.put(
	'/admin/season/:seasonID/card/:cardID/fight/:fightID/',
	adminAuth,
	fightControllers.updateBids
);

// Delete bids from DB
router.delete(
	'/admin/season/:seasonID/card/:cardID/fight/:fightID',
	adminAuth,
	fightControllers.deleteBids
);

module.exports = router;
