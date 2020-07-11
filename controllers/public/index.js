const { pastCards } = require('./pastCards');
const { getCard } = require('./getCard');
const { login } = require('./login');
const { signup } = require('./signup');
const { forgotPassword } = require('./forgotPassword');
const { resetPassword } = require('./resetPassword');

module.exports = {
	pastCards,
	getCard,
	login,
	signup,
	forgotPassword,
	resetPassword
};
