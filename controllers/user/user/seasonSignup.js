const User = require('../../../models/user');
const League = require('../../../models/league');
const Season = require('../../../models/season');

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

module.exports = { seasonSignup };
