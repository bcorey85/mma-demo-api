const League = require('../../models/league');
const Season = require('../../models/season');
const Card = require('../../models/card');

const getLeague = async (req, res) => {
	const seasonQuery = req.query.season;

	try {
		const league = await League.findOne();
		if (!league) {
			return res.status(404).send({ error: 'League does not exist.' });
		}

		const allSeasons = await Season.find().select('seasonNumber');

		if (!allSeasons) {
			return res.status(404).send({
				error: 'An error occured while selecting season numbers.'
			});
		}

		const seasonNumbers = allSeasons.map(season => season.seasonNumber);

		const seasonNumber = seasonQuery || league.activeSeason;

		if (seasonNumber === 0) {
			return res.status(200).send({
				league,
				seasonNumbers,
				cardNumbers: []
			});
		}

		const activeSeason = await Season.findOne({
			seasonNumber
		})
			.populate({
				path: 'cards',
				model: Card
			})
			.select('cards');

		let cardNumbers;
		if (!activeSeason) {
			cardNumbers = [];
		} else {
			cardNumbers = activeSeason.cards.map(card => card.cardNumber);
		}

		res.status(200).send({
			league,
			seasonNumbers,
			cardNumbers
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error:
				'An unknown error occurred. Please contact a league develop for support.'
		});
	}
};

const updateLeague = async (req, res) => {
	const activeCardNumber = req.body.activeCard;
	const activeSeasonNumber = req.body.activeSeason;

	req.body.activeCard = {
		season: activeSeasonNumber,
		card: activeCardNumber
	};

	try {
		const league = await League.findOneAndUpdate(req.body);

		if (!league) {
			return res.status(404).send({ error: 'League does not exist.' });
		}

		res.status(200).send({ message: 'League update successful' });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error:
				'An unknown error occurred. Please contact a league develop for support.'
		});
	}
};

module.exports = {
	getLeague,
	updateLeague
};
