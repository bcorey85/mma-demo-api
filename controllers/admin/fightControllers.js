const Season = require('../../models/season');
const Card = require('../../models/card');
const Bid = require('../../models/bid');

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

const getBidsByFightId = async (req, res) => {
	const { seasonID, cardID, fightID } = req.params;
	try {
		const card = await Card.findOne({
			cardCode: Card.cardCode(seasonID, cardID)
		});

		if (!card) {
			return res.status(404).send({ error: 'Unable to locate card.' });
		}

		const fight = card.fights[fightID - 1];

		const fighter1Bids = await Bid.find({
			seasonNumber: seasonID,
			cardNumber: cardID,
			fightNumber: fightID,
			fighter: fight.fighter1.name
		}).populate({
			path: 'user',
			select: 'fightName lastName'
		});

		const fighter2Bids = await Bid.find({
			seasonNumber: seasonID,
			cardNumber: cardID,
			fightNumber: fightID,
			fighter: fight.fighter2.name
		}).populate({
			path: 'user',
			select: 'fightName lastName'
		});

		return res.status(200).send({
			fight,
			fighter1Bids,
			fighter2Bids
		});
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			error: 'Unable to update bids at this time, please try again later.'
		});
	}
};

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

module.exports = {
	getPlayerListByCardId,
	getBidsByFightId,
	updateBids,
	deleteBids
};
