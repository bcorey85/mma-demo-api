const Admin = require('../models/admin');
const League = require('../models/league');

const initialDBSeed = async (adminName, password) => {
	await Admin.deleteMany();
	await League.deleteMany();

	// create new admin
	const admin = new Admin({ adminName, password });
	await admin.save();

	const league = new League({
		activeSeason: null,
		activeSeasonSignupOpen: false,
		activeCard: {
			season: null,
			card: null
		},
		activeCardBidsOpen: false,
		showBids: false
	});
	await league.save();
};

module.exports = initialDBSeed;
