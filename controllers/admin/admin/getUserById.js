const User = require('../../../models/user');

const getUserById = async (req, res) => {
	const { userID } = req.params;

	try {
		const user = await User.findOne({ _id: userID });

		if (!user) {
			return res.status(404).send({ error: 'Unable to locate user' });
		}

		res.status(200).send({ user });
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error: 'An unknown error occurred, please try again later.'
		});
	}
};

module.exports = { getUserById };
