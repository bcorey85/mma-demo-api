const express = require('express');
const router = new express.Router();
const adminAuth = require('../../middleware/adminAuth');
const seasonControllers = require('../../controllers/admin/seasonControllers');

// Create season
router.post('/admin/season/', adminAuth, seasonControllers.createSeason);

// Get season list from DB
router.get('/admin/season/', adminAuth, seasonControllers.getSeasonList);

// Get season data from DB for season update form
router.get(
	'/admin/season/:seasonID/edit',
	adminAuth,
	seasonControllers.getSeasonById
);

// Update season on DB
router.put(
	'/admin/season/:seasonID/edit',
	adminAuth,
	seasonControllers.updateSeason
);

// Delete season from DB
router.delete(
	'/admin/season/:seasonID',
	adminAuth,
	seasonControllers.deleteSeason
);

module.exports = router;
