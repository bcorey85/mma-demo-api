const User = require('../../../models/user');

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

module.exports = { getUserList };
