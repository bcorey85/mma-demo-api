const express = require('express');
const router = new express.Router();
const adminAuth = require('../../middleware/adminAuth');
const leagueControllers = require('../../controllers/admin/league');

// Get league data for admin dashboard
router.get('/admin/league', adminAuth, leagueControllers.getLeague);
router.put('/admin/league', adminAuth, leagueControllers.updateLeague);

module.exports = router;
