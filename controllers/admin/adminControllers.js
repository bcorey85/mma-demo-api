const Admin = require('../../models/admin');
const User = require('../../models/user');
const League = require('../../models/league');

const profanityFilter = require('../../utils/profanityFilter');
const capitalize = require('../../utils/capitalize');
const { sendGroupEmail } = require('../../utils/sendEmail');
const initialDBSeed = require('../../utils/initialDBSeed');

const adminLogin = async (req, res) => {
	const { adminName, password } = req.body;

	try {
		// await initialDBSeed(adminName, password);
		const admin = await Admin.login(adminName, password);

		if (!admin) {
			return res
				.status(401)
				.send({ error: 'Please check your login credentials.' });
		}

		const token = await admin.generateAuthToken();
		res.setHeader('Authorization', 'Bearer ' + token);

		return res.status(200).send({
			message: 'Login Successful',
			token: token,
			userId: admin.id,
			isAdmin: true
		});
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			error: 'Unable to log in at this time, please try again later.'
		});
	}
};

const adminLogout = async (req, res) => {
	req.token = null;
	req.admin.tokens = [];
	try {
		await req.admin.save();
		return res.status(200).send({ message: 'Successfully logged out.' });
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			error: 'Unable to logout at this time, please try again later.'
		});
	}
};

const getUserList = async (req, res) => {
	try {
		const users = await User.find().select('fightName lastName email _id');

		if (!users) {
			return res
				.status(404)
				.send({ error: 'Unable to locate user list' });
		}

		res.status(200).send({ users });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'An unknown error occurred, please try again later.'
		});
	}
};

const getUserById = async (req, res) => {
	const { userID } = req.params;

	try {
		const user = await User.findOne({ _id: userID });

		if (!user) {
			return res.status(404).send({ error: 'Unable to locate user' });
		}

		res.status(200).send({ user });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'An unknown error occurred, please try again later.'
		});
	}
};

const updateUser = async (req, res) => {
	const { userID } = req.params;
	let { firstName, fightName, lastName } = req.body;

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

		if (!user) {
			return res.status(404).send({ error: 'Unable to locate user' });
		}

		// Change user fight name or last name on all results and season leaderboards if changed
		if (user.fightname !== fightName || user.lastName !== lastName) {
			user.updateUserNames(fightName, lastName);
			user.fightName = fightName;
			user.lastName = lastName;
		}

		user.firstName = firstName;

		await user.save();

		res.status(200).send({ user });
	} catch (error) {
		console.log(error);
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

		return res.status(500).send({
			error: 'An unknown error occurred, please try again later.'
		});
	}
};

const deleteUser = async (req, res) => {
	const { userID } = req.params;

	try {
		const user = await User.findOne({ _id: userID });

		if (!user) {
			return res.status(404).send({ error: 'Unable to locate user' });
		}

		await user.remove();

		res.status(200).send({ message: 'Delete request successful' });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'An unknown error occurred, please try again later.'
		});
	}
};

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

module.exports = {
	adminLogin,
	adminLogout,
	getUserList,
	getUserById,
	updateUser,
	deleteUser,
	sendEmail
};
