const Season = require('../../../models/season');
const Card = require('../../../models/card');

const trimNames = require('../../../utils/trimNames');

//Create card - save to DB
const createCard = async (req, res) => {
	const { seasonID } = req.params;
	const { cardNumber, eventName, date, maxBids } = req.body;
	let { fights } = req.body;
	fights = trimNames(fights);

	if (maxBids > fights.length) {
		return res.status(400).send({
			error: 'Max Bids can not exceed the amount of fights'
		});
	}

	try {
		const season = await Season.findOne({ seasonNumber: seasonID });

		const cardObject = Card.createCardObject(
			seasonID,
			cardNumber,
			eventName,
			date,
			fights,
			maxBids
		);

		const card = new Card(cardObject);

		if (!season) {
			return res
				.status(404)
				.send({ error: 'Please make a season first' });
		}

		await card.save();
		season.cards.push(card);
		await season.save();

		return res.status(201).send({ message: 'Card created successfully.' });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).send({
				error:
					'Card number already exists on this season. Please try another number.'
			});
		}
		return res.status(500).send({
			error: 'Unable to create card at this time, please try again later.'
		});
	}
};

module.exports = { createCard };
