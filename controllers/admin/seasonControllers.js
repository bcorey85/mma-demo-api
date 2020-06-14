const Season = require('../../models/season');
const Card = require('../../models/card');
const League = require('../../models/league');
const User = require('../../models/user');

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

module.exports = {
	createSeason,
	getSeasonList,
	getSeasonById,
	updateSeason,
	deleteSeason
};
