const User = require('../../../models/user');
const League = require('../../../models/league');

const { sendGroupEmail } = require('../../../utils/sendEmail');

const sendEmail = async (req, res) => {
	const { title, body, activeSeasonUsers } = req.body;

	try {
		const league = await League.findOne({});
		const activeSeason = league.activeSeason;

		// Handle if admin specified current season list and no active season is set
		if (activeSeasonUsers && !activeSeason) {
			return res.status(400).send({
				error:
					'Active season does not exist. Unable to located current active seasons users.'
			});
		}

		let users;
		// Find active users in current season
		if (activeSeasonUsers === 'true' && activeSeason) {
			users = await User.find({
				'seasonStats.seasonNumber': activeSeason
			}).select('fightName lastName email');
		} else {
			users = await User.find().select('fightName lastName email');
		}

		if (!users) {
			return res
				.status(404)
				.send({ error: 'Unable to locate user list' });
		}

		sendGroupEmail(users, title, body);

		res.status(200).send({ users });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'An unknown error occurred, please try again later.'
		});
	}
};

module.exports = { sendEmail };
