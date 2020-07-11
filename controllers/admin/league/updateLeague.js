const League = require('../../../models/league');

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

module.exports = { updateLeague };
