const mongoose = require('mongoose');

const leaderBoardSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	fightName: String,
	lastName: String,
	correctPicks: {
		type: Number,
		default: null
	},
	initialPoints: {
		type: Number,
		default: 1000
	},
	points: {
		type: Number,
		default: null
	}
});

const winTotalSchema = new mongoose.Schema({
	favorite: {
		type: Number,
		default: null
	},
	underdog: {
		type: Number,
		default: null
	}
});

const seasonSchema = new mongoose.Schema({
	seasonNumber: {
		type: Number,
		required: true,
		unique: true
	},
	cards: [ { type: mongoose.Schema.Types.ObjectId, ref: 'card' } ],
	sideBar: {
		leaderBoard: [ leaderBoardSchema ],
		winTotals: {
			cardTotals: [ winTotalSchema ],
			total: winTotalSchema
		}
	}
});

seasonSchema.statics.createSeasonObject = (seasonNumber, numCards) => {
	let cardTotalsArray = [];
	for (let i = 0; i < numCards; i++) {
		cardTotalsArray.push({
			favorite: null,
			underdog: null
		});
	}

	return {
		seasonNumber: seasonNumber,
		sideBar: {
			leaderBoard: [],
			winTotals: {
				cardTotals: cardTotalsArray,
				total: {
					favorite: null,
					underdog: null
				}
			}
		}
	};
};

seasonSchema.methods.updateLeaderBoard = function() {
	const season = this;
	const cards = season.cards;

	const initialSeasonPoints = 1000;

	if (cards) {
		const users = season.sideBar.leaderBoard.map(user => {
			return user.user;
		});

		const newLeaderBoardValues = users.map(userID => {
			const playerLeaderBoard = season.sideBar.leaderBoard.filter(
				user => user.user.toString() === userID.toString()
			)[0];
			const playerResults = season.cards
				.map(card => {
					// if card results card has user, return
					const player = card.resultsCard.filter(
						userCard =>
							userCard.user.toString() === userID.toString()
					);
					return player;
				})
				.flat();

			// If player hasn't bid on a card or if they have no results
			if (playerResults.length === 0) {
				return {
					_id: playerLeaderBoard._id,
					user: playerLeaderBoard.user,
					fightName: playerLeaderBoard.fightName,
					lastName: playerLeaderBoard.lastName,
					initialPoints: initialSeasonPoints,
					correctPicks: null,
					points: initialSeasonPoints
				};
			}

			// If player has results
			const totalCorrectPicks = playerResults
				.map(result => result.correctPicks)
				.reduce((acc, cur) => {
					return acc + cur;
				}, 0);
			const totalAdjustedPoints = playerResults
				.map(result => result.adjustedPoints)
				.reduce((acc, cur) => {
					return acc + cur;
				}, 0);

			return {
				_id: playerLeaderBoard._id,
				user: playerResults[0].user,
				fightName: playerResults[0].fightName,
				lastName: playerResults[0].lastName,
				initialPoints: initialSeasonPoints,
				correctPicks: totalCorrectPicks,
				points: initialSeasonPoints + totalAdjustedPoints
			};
		});

		return newLeaderBoardValues;
	}
};

seasonSchema.methods.updateWinTotals = function() {
	const season = this;

	//get all win totals and update
	const cardsWinTotals = season.cards.map(card => card.winTotals);

	const newCardTotals = season.sideBar.winTotals.cardTotals.map(
		(total, i) => {
			if (cardsWinTotals[i]) {
				return {
					_id: total._id,
					favorite: cardsWinTotals[i].favorite,
					underdog: cardsWinTotals[i].underdog
				};
			} else {
				return {
					_id: total._id,
					favorite: total.favorite,
					underdog: total.underdog
				};
			}
		}
	);

	const totalFavorite = cardsWinTotals
		.map(card => card.favorite)
		.reduce((acc, cur) => {
			return cur + acc;
		}, 0);

	const totalUnderdog = cardsWinTotals
		.map(card => card.underdog)
		.filter(val => val !== null)
		.reduce((acc, cur) => {
			return cur + acc;
		}, 0);

	const newWinTotals = {
		cardTotals: [ ...newCardTotals ],
		total: {
			favorite: totalFavorite,
			underdog: totalUnderdog
		}
	};

	return newWinTotals;
};

//sort leaderBoard
seasonSchema.statics.createSidebarObject = (
	leaderBoardArray,
	cardTotalsArray,
	totalObject
) => {
	leaderBoardArray.sort((a, b) => {
		return b.points - a.points;
	});
	return {
		leaderBoard: leaderBoardArray,
		winTotals: {
			cardTotals: cardTotalsArray,
			total: totalObject
		}
	};
};

seasonSchema.pre('remove', async function(next) {
	const season = this;

	// Delete all associated Cards, Bids
	try {
		await this.model('Card').deleteMany({
			seasonNumber: season.seasonNumber
		});
		await this.model('Bid').deleteMany({
			seasonNumber: season.seasonNumber
		});

		const users = await this.model('User')
			.find({
				'seasonStats.seasonNumber': season.seasonNumber
			})
			.populate({
				path: 'bids',
				model: 'Bid'
			});

		// Remove bids and card stats from user model
		users.forEach(async user => {
			user.bids = user.bids.filter(
				bid =>
					bid.seasonNumber.toString() !==
					season.seasonNumber.toString()
			);

			const seasonIndex = user.seasonStats.findIndex(
				seasonStats => seasonStats.seasonNumber === season.seasonNumber
			);
			user.seasonStats.splice(seasonIndex, 1);

			await user.save();
		});
	} catch (error) {
		console.log(error);
	}

	next();
});

const Season = mongoose.model('Season', seasonSchema);

module.exports = Season;
