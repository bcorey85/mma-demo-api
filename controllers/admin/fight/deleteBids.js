const Season = require('../../../models/season');
const Card = require('../../../models/card');
const Bid = require('../../../models/bid');

const deleteBids = async (req, res) => {
	const { seasonID, cardID, fightID } = req.params;

	try {
		const card = await Card.findOne({
			cardCode: Card.cardCode(seasonID, cardID)
		}).populate({
			path: 'resultsCard.bids',
			model: Bid
		});

		if (!card) {
			return res.status(404).send('Unable to locate card.');
		}

		card.fights[fightID - 1].fighter1.outcome = '';
		card.fights[fightID - 1].fighter2.outcome = '';
		card.fights[fightID - 1].fighter1Bids = [];
		card.fights[fightID - 1].fighter2Bids = [];

		const bids = await Bid.find({
			seasonNumber: seasonID,
			cardNumber: cardID,
			fightNumber: fightID
		});

		await card.removeBids(bids);

		// Check to see if users bids are empty, if so, delete from results card
		const usersWithBids = card.resultsCard.filter(
			user => user.bids.length !== 0
		);

		card.resultsCard = usersWithBids;

		card.resultsCard = card.updateResultsCard();

		card.winTotals = card.updateWinTotals();

		await card.save();

		const season = await Season.findOne({
			seasonNumber: seasonID
		}).populate({ path: 'cards', model: Card });

		if (!season) {
			return res.status(404).send({ error: 'Unable to locate season.' });
		}

		season.sideBar.leaderBoard = season.updateLeaderBoard();
		season.sideBar.winTotals = season.updateWinTotals();

		season.save();

		res.status(200).send({ message: 'Bids deleted successfully.' });
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			error: 'Unable to delete bids at this time, please try again later.'
		});
	}
};

module.exports = { deleteBids };
