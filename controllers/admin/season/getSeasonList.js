const Season = require('../../../models/season');
const Card = require('../../../models/card');
const League = require('../../../models/league');
const User = require('../../../models/user');

//UPDATE SEASON - SHOW LIST
const getSeasonList = async (req, res) => {
	try {
		const seasons = await Season.find({});

		const seasonNumbers = seasons
			.map(season => season.seasonNumber)
			.sort((a, b) => {
				return a - b;
			});

		res.send({ seasonNumbers: seasonNumbers });

		if (!seasons) {
			return res.status(404).send({
				error: 'No seasons exist, please create a new one.'
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'Unable to load season information, please try again later.'
		});
	}
};

module.exports = { getSeasonList };
