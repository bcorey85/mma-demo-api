const User = require('../../../models/user');
const Card = require('../../../models/card');
const Bid = require('../../../models/bid');
const League = require('../../../models/league');
const Season = require('../../../models/season');

const getUserById = async (req, res) => {
	const { userID } = req.params;

	try {
		const user = await User.findOne({ _id: userID })
			.select('-role')
			.populate({
				path: 'bids',
				model: Bid
			});

		if (!user) {
			return res.status(404).send({ error: 'User data not found' });
		}

		// If user has signed up for at least one season, send stats, if not send null to handle case of newly registered user
		let seasonLeaderboardStats;
		if (user.seasonStats.length) {
			const mostRecentSeason = user.seasonStats.sort(
				(a, b) => b.seasonNumber - a.seasonNumber
			)[0].seasonNumber;

			const season = await Season.findOne({
				seasonNumber: mostRecentSeason
			});

			if (!season) {
				return res.status(404).send({ error: 'Season data not found' });
			}

			const currentUser = season.sideBar.leaderBoard.filter(
				user => JSON.stringify(user.user) === JSON.stringify(userID)
			)[0];

			// Make copy of stats object to add seasonNumber on
			seasonLeaderboardStats = JSON.parse(JSON.stringify(currentUser));

			seasonLeaderboardStats.seasonNumber = season.seasonNumber;
		} else {
			seasonLeaderboardStats = {
				correctPicks: 0,
				initialPoints: 0,
				points: 0,
				fightName: user.fightName,
				lastName: user.lastName
			};
		}

		const league = await League.findOne({});

		if (!league) {
			return res.status(404).send({ error: 'League data not found' });
		}

		// If league in maintenance mode
		if (!league.activeSeason || !league.activeCard.card) {
			return res.status(200).send({
				userData: user,
				leagueState: league,
				seasonLeaderboardStats: seasonLeaderboardStats,
				seasonCardStats: null,
				currentUserBids: {
					eventName: null,
					date: null,
					bids: null
				}
			});
		}

		// Compile current user stats based on active card/season
		const allCards = await Card.find({
			seasonNumber: league.activeCard.season
		});

		const seasonCardStats = allCards
			.map(card => {
				const currentUserStats = card.resultsCard.filter(
					user => user.user.toString() === userID
				)[0];

				if (currentUserStats) {
					return {
						cardNumber: card.cardNumber,
						results: currentUserStats
					};
				}
				return;
			})
			.filter(stats => stats !== undefined);

		const currentCard = await Card.findOne({
			seasonNumber: league.activeCard.season,
			cardNumber: league.activeCard.card
		}).select('eventName date');

		if (!currentCard) {
			res.status(200).send({
				userData: user,
				leagueState: league,
				seasonLeaderboardStats,
				seasonCardStats,
				currentUserBids: {
					eventName: '',
					date: '',
					bids: []
				}
			});
		}

		const bids = await Bid.find({
			seasonNumber: league.activeCard.season,
			cardNumber: league.activeCard.card,
			user: userID
		});

		res.status(200).send({
			userData: user,
			leagueState: league,
			seasonLeaderboardStats,
			seasonCardStats,
			currentUserBids: {
				eventName: currentCard.eventName,
				date: currentCard.date,
				bids
			}
		});
	} catch (error) {
		console.log(error);

		return res.status(500).send({
			error:
				'An unknown error occured. Please contact a league developer for support'
		});
	}
};

module.exports = { getUserById };
