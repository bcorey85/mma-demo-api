const Season = require('../../../models/season');
const Card = require('../../../models/card');
const League = require('../../../models/league');
const User = require('../../../models/user');

//DELETE SEASON
const deleteSeason = async (req, res) => {
	const { seasonID } = req.params;
	try {
		const season = await Season.findOne({
			seasonNumber: seasonID
		});

		if (!season) {
			return res.status(404).send({ error: 'Unable to find season.' });
		}

		await season.remove();

		return res
			.status(200)
			.send({ message: 'Season deleted successfully.' });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'Unable to load season information, please try again later.'
		});
	}
};

module.exports = { deleteSeason };
