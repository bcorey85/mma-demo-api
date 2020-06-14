const User = require('../../models/user');
const Card = require('../../models/card');
const Bid = require('../../models/bid');
const League = require('../../models/league');
const Season = require('../../models/season');

const capitalize = require('../../utils/capitalize');
const profanityFilter = require('../../utils/profanityFilter');

const logout = async (req, res) => {
	const userID = req.params.userID;
	const user = await User.findOne({ _id: userID });

	if (!user) {
		return res.status(404).send({ error: 'User data not found' });
	}

	return res.status(200).send('Logout Successful');
};

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

const seasonSignup = async (req, res) => {
	const { userID, seasonID } = req.params;

	try {
		const league = await League.findOne();

		if (!league) {
			return res.status(404).send({ error: 'League data not found' });
		}

		// Check to see if submitting to current active season and that season is open for signup
		if (
			!parseInt(seasonID) === league.activeSeason ||
			!league.activeSeasonSignupOpen
		) {
			return res.status(422).send({
				error: `Season ${seasonID} is not currently open for signup. Please contact a league develop for support.`
			});
		}

		const season = await Season.findOne({ seasonNumber: seasonID });

		if (!season) {
			return res.status(404).send({ error: 'Season data not found' });
		}

		const user = await User.findOne({ _id: userID }).select('-bids');

		// Make sure user isnt already signed up for active season
		const alreadySignedUp = season.sideBar.leaderBoard.findIndex(
			user => user.user.toString() === userID
		);

		if (alreadySignedUp >= 0) {
			return res
				.status(409)
				.send({ error: 'User is already signed up for this season.' });
		}

		// Add user to season
		season.sideBar.leaderBoard.push({
			user: userID,
			fightName: user.fightName,
			lastName: user.lastName,
			correctPicks: null,
			initialPoints: 1000,
			points: 1000
		});

		await season.save();

		user.seasonStats.push({
			season: season._id,
			seasonActive: true,
			seasonNumber: seasonID,
			cardStats: []
		});

		await user.save();

		res.status(200).send({ message: 'Season sign up complete!' });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error:
				'An unknown error occured. Please contact a league developer for support'
		});
	}
};

const updateUserDetails = async (req, res) => {
	const userID = req.params.userID;
	const { email, password } = req.body.inputState;
	let { firstName, fightName, lastName } = req.body.inputState;

	firstName = capitalize(firstName);
	fightName = fightName.toUpperCase();
	lastName = capitalize(lastName);

	const profanityCheck = profanityFilter([ firstName, fightName, lastName ]);

	if (profanityCheck.length > 0) {
		return res.status(400).send({
			error: 'Invalid Submission: Clean up your language fool!'
		});
	}

	try {
		const user = await User.findOne({ _id: userID });

		user.email = email;
		user.firstName = firstName;

		// Change user fight name or last name on all results and season leaderboards if changed
		if (user.fightname !== fightName || user.lastName !== lastName) {
			user.updateUserNames(fightName, lastName);
			user.fightName = fightName;
			user.lastName = lastName;
		}

		if (password) {
			user.password = password;
		}

		const token = await user.generateAuthToken();

		await user.save();

		return res.status(200).send({
			message: 'User details updated successfully',
			token: token,
			userId: user.id,
			isAdmin: false
		});
	} catch (error) {
		if (error.errors.password) {
			if (error.errors.password.kind === 'minlength') {
				return res
					.status(400)
					.send({ error: 'Password must be at least 6 characters' });
			}
		}

		if (error.errors.email) {
			if (error.errors.email.kind === 'regexp') {
				return res
					.status(400)
					.send({ error: 'Please enter a valid email' });
			}

			if (error.errors.email.kind === 'required') {
				return res
					.status(400)
					.send({ error: 'Please enter a valid email' });
			}
		}

		if (error.errors.firstName) {
			if (error.errors.firstName.kind === 'required') {
				return res
					.status(400)
					.send({ error: 'Please enter a First Name' });
			}
		}

		if (error.errors.fightName) {
			if (error.errors.fightName.kind === 'required') {
				return res
					.status(400)
					.send({ error: 'Please enter a Fight Name' });
			}
		}

		if (error.errors.lastName) {
			if (error.errors.lastName.kind === 'required') {
				return res
					.status(400)
					.send({ error: 'Please enter a Last Name' });
			}
		}
	}

	res.status(200).send({ message: 'User details updated successfully' });
};

module.exports = {
	logout,
	getUserById,
	seasonSignup,
	updateUserDetails
};
