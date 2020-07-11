const Season = require('../../../models/season');
const Card = require('../../../models/card');
const Bid = require('../../../models/bid');

const updateBids = async (req, res) => {
	const { seasonID, cardID, fightID } = req.params;
	const { fighter1Bids, fighter2Bids } = req.body;

	try {
		const card = await Card.findOne({
			cardCode: Card.cardCode(seasonID, cardID)
		});

		if (!card) {
			return res.status(404).send({ error: 'Unable to locate card.' });
		}

		const fight = card.fights[fightID - 1];

		fight.fighter1.outcome = req.body.fighter1.outcome;
		fight.fighter2.outcome = req.body.fighter2.outcome;

		await card.updateBids([ fighter1Bids, fighter2Bids ]);

		await card.save();

		// Call card again to repopulate with new bids before updating results card to fix timing issues
		const updatedCard = await Card.findOne({
			cardCode: Card.cardCode(seasonID, cardID)
		}).populate({
			path: 'resultsCard.bids',
			model: Bid
		});

		updatedCard.resultsCard = updatedCard.updateResultsCard();
		updatedCard.winTotals = updatedCard.updateWinTotals();

		await updatedCard.save();

		const season = await Season.findOne({
			seasonNumber: seasonID
		}).populate({ path: 'cards', model: Card });

		if (!season) {
			return res.status(404).send({ error: 'Unable to locate season.' });
		}

		// Sort points high to low
		season.sideBar.leaderBoard = season.updateLeaderBoard().sort((a, b) => {
			return b.points - a.points;
		});

		season.sideBar.winTotals = season.updateWinTotals();

		await season.save();

		res.status(200).send({ message: 'Bids updated successfully.' });
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			error: 'Unable to create bids at this time, please try again later.'
		});
	}
};

module.exports = { updateBids };
