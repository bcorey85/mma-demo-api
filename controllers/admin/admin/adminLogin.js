const Admin = require('../../../models/admin');

const adminLogin = async (req, res) => {
	const { adminName, password } = req.body;

	try {
		const admin = await Admin.login(adminName, password);

		if (!admin) {
			return res
				.status(401)
				.send({ error: 'Please check your login credentials.' });
		}
		// initialDBSeed(adminName, password);
		const token = await admin.generateAuthToken();
		res.setHeader('Authorization', 'Bearer ' + token);

		return res.status(200).send({
			message: 'Login Successful',
			token: token,
			userId: admin.id,
			isAdmin: true
		});
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			error: 'Unable to log in at this time, please try again later.'
		});
	}
};

module.exports = { adminLogin };
