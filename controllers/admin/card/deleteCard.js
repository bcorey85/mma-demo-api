const Season = require('../../../models/season');
const Card = require('../../../models/card');

//Delete card from DB
const deleteCard = async (req, res) => {
	const { seasonID, cardID } = req.params;

	try {
		const season = await Season.findOne({ seasonNumber: seasonID })
			.select('cards')
			.populate({
				path: 'cards',
				model: Card
			});

		if (!season) {
			return res.status(404).send('Unable to locate season.');
		}

		// // Get id from card before delete in order to delete from season
		season.cards = season.cards.filter(card => {
			return card.cardNumber.toString() !== cardID;
		});

		await season.save();

		const card = await Card.findOne({
			seasonNumber: seasonID,
			cardNumber: cardID
		});

		if (!card) {
			return res.status(404).send('Unable to locate card.');
		}

		card.remove();

		res.status(200).send({ message: 'Card deleted successfully.' });
	} catch (error) {
		console.log(error);

		res.status(500).send({
			error: 'Unable to delete card at this time, please try again later.'
		});
	}
};

module.exports = { deleteCard };
