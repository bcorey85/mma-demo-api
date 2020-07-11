const User = require('../../models/user');

const capitalize = require('../../utils/capitalize');
const profanityFilter = require('../../utils/profanityFilter');

const signup = async (req, res) => {
	const { inviteCode, email, password } = req.body;

	let { firstName, fightName, lastName } = req.body;

	if (
		!inviteCode ||
		!firstName ||
		!fightName ||
		!lastName ||
		!email ||
		!password
	) {
		return res.status(400).send({ error: 'Please check required inputs' });
	}

	if (inviteCode !== process.env.INVITE_CODE) {
		return res
			.status(400)
			.send({ error: 'Please contact a league developer for support' });
	}

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
		const user = await User.create({
			firstName,
			fightName,
			lastName,
			email,
			password
		});

		const token = await user.generateAuthToken();

		res.setHeader('Authorization', 'Bearer ' + token);

		return res.status(201).send({
			message: 'Login Successful',
			token: token,
			userId: user.id,
			isAdmin: false
		});
	} catch (error) {
		if (error.code === 11000) {
			const fightNameError = error.errmsg.match(/fightName/);
			const emailError = error.errmsg.match(/email/);

			if (fightNameError) {
				return res.status(409).send({
					error: 'A user is already registered with that Fight Name'
				});
			}
			if (emailError) {
				return res.status(409).send({
					error: 'A user is already registered with that Email'
				});
			}
		}

		if (error.errors.password) {
			if (error.errors.password.kind === 'minlength') {
				return res
					.status(400)
					.send({ error: 'Password must be at least 6 characters' });
			}

			if (error.errors.password.kind === 'required') {
				return res.status(400).send({ error: 'Password is required' });
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

		return res.status(500).send({
			error:
				'An error occured during sign up. Please contact a league developer for support'
		});
	}
};

module.exports = { signup };
