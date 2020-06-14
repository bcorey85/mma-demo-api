const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const adminEmailAccount = process.env.ADMIN_EMAIL;

const sendResetPassword = (email, resetToken) => {
	const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
	const msg = {
		to: email,
		from: `MMA Fantasy Sports League <${adminEmailAccount}>`,
		subject: 'MMA Fantasy Sports League Password Reset Link',
		html: `A password reset request was made for your MMA Fantasy Sports League account.  <a href=${resetLink}>Click here to reset your password.</a>`
	};
	sgMail.send(msg);
};

const sendGroupEmail = (userArray, title, body) => {
	userArray.forEach(user => {
		const msg = {
			to: user.email,
			from: `MMA Fantasy Sports League <${adminEmailAccount}>`,
			subject: `MMA Fantasy Sports League - ${title}`,
			html: `${body}`
		};
		sgMail.send(msg);
	});
};

module.exports = {
	sendResetPassword,
	sendGroupEmail
};
