const Season = require('../../models/season');
const Card = require('../../models/card');
const Bid = require('../../models/bid');

const trimNames = require('../../utils/trimNames');

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

//Update card in DB - Fights meta & point adjustments
const updateCard = async (req, res) => {
	const { seasonID, cardID } = req.params;
	const { resultsCard, eventName, date } = req.body;
	let { fights } = req.body;
	fights = trimNames(fights);

	try {
		const card = await Card.findOne({
			cardCode: Card.cardCode(seasonID, cardID)
		});

		if (!card) {
			return res.status(404).send({ error: 'Unable to locate card.' });
		}

		// Check if fighter has updated info. Prevent admin from updating fighter info with existing bids.
		let invalidFightUpdate;
		card.fights.forEach(fight => {
			const newFightIndex = fights.findIndex(
				newFight => newFight.fightNumber === fight.fightNumber
			);
			const newFight = fights[newFightIndex];

			const checkFighter1 =
				(fight.fighter1.name !== newFight.fighter1.name ||
					fight.fighter1.moneyLine !== newFight.fighter1.moneyLine) &&
				fight.fighter1Bids.length > 0;

			const checkFighter2 =
				(fight.fighter2.name !== newFight.fighter2.name ||
					fight.fighter2.moneyLine !== newFight.fighter2.moneyLine) &&
				fight.fighter2Bids.length > 0;

			if (checkFighter1 || checkFighter2) {
				invalidFightUpdate = fight;
			} else {
				fight.fighter1 = newFight.fighter1;
				fight.fighter2 = newFight.fighter2;
			}
		});

		if (invalidFightUpdate) {
			return res.status(400).send({
				error: `Unable to update Fight ${invalidFightUpdate.fightNumber} due to existing bids. Please delete bids before updating fighter info.`
			});
		}
		card.resultsCard = resultsCard;

		card.eventName = eventName;
		card.date = date;
		await card.save();

		const season = await Season.findOne({
			seasonNumber: seasonID
		}).populate({ path: 'cards', model: Card });

		if (!season) {
			return res.status(404).send({ error: 'Unable to locate season.' });
		}

		season.sideBar.leaderBoard = season.updateLeaderBoard().sort((a, b) => {
			return b.points - a.points;
		});
		season.sideBar.winTotals = season.updateWinTotals();

		await season.save();
		res.status(200).send({ message: 'Card updated successfully.' });
	} catch (error) {
		console.log(error);

		res.status(500).send({
			error:
				'Unable to update card at this time. Double check required inputs or try again later.'
		});
	}
};

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

module.exports = {
	createCard,
	getCardById,
	updateCard,
	deleteCard
};
