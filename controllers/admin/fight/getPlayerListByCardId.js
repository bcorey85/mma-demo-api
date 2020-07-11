const Season = require('../../../models/season');
const Card = require('../../../models/card');
const Bid = require('../../../models/bid');

const getPlayerListByCardId = async (req, res) => {
	const { seasonID, cardID } = req.params;

	try {
		const card = await Card.findOne({
			cardCode: Card.cardCode(seasonID, cardID)
		});

		if (!card) {
			return res.status(404).send({ error: 'Unable to locate card.' });
		}

		const playerList = card.resultsCard.map(player => {
			return {
				fightName: player.fightName,
				lastName: player.lastName
			};
		});

		return res.status(200).send({ playerList: playerList });
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			error: 'Unable to create bids at this time, please try again later.'
		});
	}
};

module.exports = { getPlayerListByCardId };
