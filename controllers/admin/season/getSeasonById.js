const Season = require('../../../models/season');
const Card = require('../../../models/card');
const League = require('../../../models/league');
const User = require('../../../models/user');

//UPDATE SEASON - SHOW SEASON TO EDIT
const getSeasonById = async (req, res) => {
	const { seasonID } = req.params;
	try {
		const season = await Season.findOne({
			seasonNumber: seasonID
		}).populate({ path: 'cards', model: Card });
		const league = await League.findOne({});
		if (!season || !league) {
			return res.status(404).send({ error: 'Season does not exist.' });
		}
		return res.send({ season });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'Unable to load season information, please try again later.'
		});
	}
};

module.exports = { getSeasonById };
