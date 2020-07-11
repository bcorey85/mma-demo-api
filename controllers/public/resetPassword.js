const crypto = require('crypto');
const User = require('../../models/user');

const resetPassword = async (req, res) => {
	const { resetToken } = req.params;
	const { password } = req.body;

	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() }
	});

	if (!user) {
		return res.status(404).send({
			error:
				'Invalid password reset token. Please initiate a new request.'
		});
	}

	if (!password || password.length < 6) {
		return res.status(404).send({
			error: 'Please enter a valid password'
		});
	}

	user.password = password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	const token = await user.generateAuthToken();

	await user.save();

	return res.status(200).send({
		message: 'Password reset successful',
		token: token,
		userId: user.id,
		isAdmin: false
	});
};

module.exports = { resetPassword };
