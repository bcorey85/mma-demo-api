const mongoose = require('mongoose');
const calcPoints = require('../utils/calcPoints');

const fightSchema = new mongoose.Schema({
	fightNumber: {
		type: Number,
		default: null
	},
	fighter1: {
		name: String,
		image: String,
		moneyLine: Number,
		outcome: {
			type: String,
			default: ''
		}
	},
	fighter1Bids: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Bid'
		}
	],
	fighter2: {
		name: String,
		image: String,
		moneyLine: Number,
		outcome: {
			type: String,
			default: ''
		}
	},
	fighter2Bids: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Bid'
		}
	]
});

const resultsCardSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	fightName: String,
	lastName: String,
	bids: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Bid'
		}
	],
	correctPicks: {
		type: Number,
		default: null
	},
	points: {
		type: Number,
		default: null
	},
	pointsSpent: {
		type: Number,
		default: null
	},
	adjustments: {
		type: Number,
		default: null
	},
	adjustedPoints: {
		type: Number,
		default: null
	}
});

const cardSchema = new mongoose.Schema({
	cardCode: {
		type: String,
		required: true,
		unique: true
	},
	seasonNumber: {
		type: Number,
		required: true
	},
	cardNumber: {
		type: Number,
		required: true
	},
	eventName: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true
	},
	maxBids: {
		type: Number,
		required: true,
		default: 4
	},
	fights: [ fightSchema ],
	resultsCard: [ resultsCardSchema ],
	winTotals: {
		favorite: Number,
		underdog: Number
	}
});

cardSchema.methods.updateResultsCard = function() {
	const card = this;
	// Update Points, Correct Picks, and Adjusted Points for each player result
	const newResults = card.resultsCard
		.map(player => {
			const bidsWithResults = player.bids.filter(bid => {
				return bid.points !== null;
			});

			const totalPoints = bidsWithResults
				.map(bid => bid.points)
				.reduce((acc, cur) => {
					return acc + cur;
				}, 0);

			const pointsSpent = player.bids.reduce((acc, cur) => {
				return acc + cur.bid;
			}, 0);

			// If no bids have results, return current player result with no changes
			if (bidsWithResults.length === 0) {
				return {
					_id: player._id,
					user: player.user,
					fightName: player.fightName,
					lastName: player.lastName,
					bids: player.bids,
					pointsSpent: pointsSpent,
					points: null,
					correctPicks: null,
					adjustments: player.adjustments,
					adjustedPoints: totalPoints + player.adjustments
				};
			}

			const totalCorrectPicks = bidsWithResults.filter(bid => {
				return bid.outcome.toLowerCase() === 'w';
			}).length;

			return {
				_id: player._id,
				user: player.user,
				fightName: player.fightName,
				lastName: player.lastName,
				bids: player.bids,
				pointsSpent: pointsSpent,
				points: totalPoints,
				correctPicks: totalCorrectPicks,
				adjustments: player.adjustments,
				adjustedPoints: totalPoints + player.adjustments
			};
		})
		.sort((a, b) => {
			return b.points - a.points;
		});

	return newResults;
};

cardSchema.methods.updateWinTotals = function() {
	const card = this;

	const fightsWithOutcomes = card.fights.filter(fight => {
		const f1outcome = fight.fighter1.outcome;
		const f2outcome = fight.fighter2.outcome;

		//Filter out 'x' (ie: DQs) and other edge cases where w/l is not entered correctly
		if (
			(f1outcome === 'w' && f2outcome === 'l') ||
			(f1outcome === 'l' && f2outcome === 'w')
		) {
			return fight;
		}
	});

	const totalFights = fightsWithOutcomes.length;

	const numFavoriteWins = fightsWithOutcomes
		.map(fight => {
			const f1Favorite =
				fight.fighter1.moneyLine <= fight.fighter2.moneyLine;
			const f2Favorite =
				fight.fighter1.moneyLine >= fight.fighter2.moneyLine;

			const f1Winner = fight.fighter1.outcome.toLowerCase() === 'w';
			const f2Winner = fight.fighter2.outcome.toLowerCase() === 'w';

			if ((f1Winner && f1Favorite) || (f2Winner && f2Favorite)) {
				return 1;
			} else {
				return 0;
			}
		})
		.reduce((acc, cur) => {
			return acc + cur;
		}, 0);

	const winTotals = {
		favorite: numFavoriteWins,
		underdog: totalFights - numFavoriteWins
	};

	return winTotals;
};

cardSchema.methods.updateBids = async function(bidArrays) {
	for (const bidArray of bidArrays) {
		for (const newBid of bidArray) {
			try {
				const oldBid = await this.model('Bid').findOne({
					_id: newBid._id
				});

				oldBid.bid = newBid.bid;

				// use points calculated from backend instead of front end
				oldBid.points = calcPoints(
					newBid.moneyLine,
					newBid.bid,
					newBid.outcome
				);
				oldBid.outcome = newBid.outcome;

				await oldBid.save();
			} catch (error) {
				console.log(error);
			}
		}
	}
};

cardSchema.statics.cardCode = (seasonID, cardID) => {
	return `s${seasonID}c${cardID}`;
};

cardSchema.statics.createResultsCardArray = array => {
	return array.map(player => {
		return {
			fightName: player.fightName,
			lastName: player.lastName,
			correctPicks: null,
			points: null,
			adjustments: null,
			adjustedPoints: null
		};
	});
};

cardSchema.statics.createCardObject = (
	seasonID,
	cardID,
	eventName,
	date,
	fights,
	maxBids,
	resultsCardArray
) => {
	return {
		cardCode: Card.cardCode(seasonID, cardID),
		cardNumber: cardID,
		seasonNumber: seasonID,
		eventName: eventName,
		date: date,
		fights: fights,
		maxBids,
		resultsCard: resultsCardArray,
		winTotals: {
			favorite: null,
			underdog: null
		}
	};
};

cardSchema.statics.sortPoints = (array, field = 'adjustedPoints') => {
	if (!array) {
		return undefined;
	}

	return array.sort((a, b) => {
		return b[field] - a[field];
	});
};

cardSchema.methods.removeBids = async function(bidsArr) {
	const card = this;
	for (const bid of bidsArr) {
		const bidUser = card.resultsCard.filter(
			user => user.user.toString() === bid.user.toString()
		)[0];

		bidUser.bids = bidUser.bids.filter(
			existingBid => existingBid._id.toString() !== bid._id.toString()
		);

		await bid.remove();
	}
};

cardSchema.pre('remove', async function(next) {
	const card = this;

	// Delete all associated Bids
	await this.model('Bid').deleteMany({
		seasonNumber: card.seasonNumber,
		cardNumber: card.cardNumber
	});
	const users = await this.model('User')
		.find({
			'seasonStats.seasonNumber': card.seasonNumber
		})
		.populate({
			path: 'bids',
			model: 'Bid'
		});

	// Remove bids and User Card Stats for season from user model
	users.forEach(async user => {
		user.bids = user.bids.filter(
			bid => bid.cardNumber.toString() !== card.cardNumber.toString()
		);

		const seasonIndex = user.seasonStats.findIndex(
			season =>
				card.seasonNumber.toString() === season.seasonNumber.toString()
		);

		const cardIndex = user.seasonStats[seasonIndex].cardStats.findIndex(
			cardStatsID => cardStatsID.toString() === card._id.toString()
		);

		user.seasonStats[seasonIndex].cardStats.splice(cardIndex, 1);
		await user.save();
	});

	next();
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
