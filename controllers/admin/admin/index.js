const { adminLogin } = require('./adminLogin');
const { deleteUser } = require('./deleteUser');
const { getUserById } = require('./getUserById');
const { getUserList } = require('./getUserList');
const { sendEmail } = require('./sendEmail');
const { updateUser } = require('./updateUser');

module.exports = {
	adminLogin,
	deleteUser,
	getUserById,
	getUserList,
	sendEmail,
	updateUser
};
