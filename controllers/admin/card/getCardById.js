const Season = require('../../../models/season');
const Card = require('../../../models/card');
const Bid = require('../../../models/bid');

//Get card by id
const getCardById = async (req, res) => {
	const { seasonID, cardID } = req.params;

	try {
		const card = await Card.findOne({
			cardCode: Card.cardCode(seasonID, cardID)
		}).populate({
			path: 'resultsCard.bids',
			model: Bid
		});

		const season = await Season.findOne({ seasonNumber: seasonID });

		if (!card) {
			return res.status(404).send('Unable to locate card');
		}

		// Pagination
		let pagination = {};
		const totalCards = season.cards.length;
		if (cardID < totalCards) {
			pagination.next = {
				seasonID,
				cardID: parseInt(cardID) + 1
			};
		}

		if (cardID > 1) {
			pagination.prev = {
				seasonID,
				cardID: parseInt(cardID) - 1
			};
		}

		return res.status(200).send({ card, pagination });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'Unable to locate card at this time, please try again later'
		});
	}
};

module.exports = { getCardById };
