const User = require('../../models/user');

const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.login(email, password);
		if (!user) {
			return res
				.status(401)
				.send({ error: 'Please check your login credentials.' });
		}

		const token = await user.generateAuthToken();
		res.setHeader('Authorization', 'Bearer ' + token);

		return res.status(200).send({
			message: 'Login Successful',
			token: token,
			userId: user.id,
			isAdmin: false
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			error:
				'An error occured during sign up. Please contact a league developer for support'
		});
	}
};

module.exports = { login };
