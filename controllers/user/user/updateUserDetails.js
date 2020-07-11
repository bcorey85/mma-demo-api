const User = require('../../../models/user');

const capitalize = require('../../../utils/capitalize');
const profanityFilter = require('../../../utils/profanityFilter');

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

module.exports = { updateUserDetails };
