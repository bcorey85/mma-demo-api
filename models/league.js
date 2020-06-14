const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
	activeSeason: {
		type: Number,
		default: 0
	},
	activeSeasonSignupOpen: {
		type: Boolean,
		required: true,
		default: false
	},
	activeCard: {
		season: {
			type: Number,
			default: 0
		},
		card: {
			type: Number,
			default: 0
		}
	},
	activeCardBidsOpen: {
		type: Boolean,
		required: true,
		default: false
	},
	showBids: {
		type: Boolean,
		required: true,
		default: false
	}
});

const League = mongoose.model('League', leagueSchema);

module.exports = League;
