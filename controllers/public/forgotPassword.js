const User = require('../../models/user');

const { sendResetPassword } = require('../../utils/sendEmail');

const forgotPassword = async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email }).select(
		'fightName lastName email'
	);

	if (!user) {
		return res
			.status(404)
			.send({ error: 'Unable to locate user with that email' });
	}

	const resetToken = user.generateResetPasswordToken();

	await user.save();

	try {
		await sendResetPassword(email, resetToken);
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error:
				'An error occured during password reset. Please contact a league developer for support'
		});
	}

	res.status(200).send({ message: 'Password email sent' });
};

module.exports = { forgotPassword };
