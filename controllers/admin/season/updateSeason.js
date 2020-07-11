const Season = require('../../../models/season');
const Card = require('../../../models/card');
const League = require('../../../models/league');
const User = require('../../../models/user');

//UPDATE SEASON - No longer used
const updateSeason = async (req, res) => {
	try {
		return res
			.status(200)
			.send({ message: 'Season updated successfully.' });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'Unable to load season information, please try again later.'
		});
	}
};

module.exports = { updateSeason };
