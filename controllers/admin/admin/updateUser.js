const User = require('../../../models/user');

const profanityFilter = require('../../../utils/profanityFilter');
const capitalize = require('../../../utils/capitalize');

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

module.exports = { updateUser };
