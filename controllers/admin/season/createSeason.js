const Season = require('../../../models/season');
const Card = require('../../../models/card');
const League = require('../../../models/league');
const User = require('../../../models/user');

// CREATE SEASON - POST TO DB
const createSeason = async (req, res) => {
	const { seasonNumber } = req.body;

	const existingSeason = await Season.findOne({ seasonNumber: seasonNumber });
	if (existingSeason) {
		return res.status(409).send({
			error: 'Season already exists. Please select a new season number.'
		});
	}

	const seasonObject = Season.createSeasonObject(seasonNumber, 4);
	const season = new Season(seasonObject);

	try {
		await season.save();
		return res.status(201).send({ message: 'Season created successfully' });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'Season creation failed, please try again later.'
		});
	}
};

module.exports = { createSeason };
