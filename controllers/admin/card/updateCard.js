const Season = require('../../../models/season');
const Card = require('../../../models/card');

const trimNames = require('../../../utils/trimNames');

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

module.exports = { updateCard };
