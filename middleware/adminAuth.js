const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const adminAuth = async (req, res, next) => {
	try {
		if (!req.headers.authorization) {
			return res.status(401).send({
				error: 'You must be logged in to perform that action'
			});
		}

		const token = req.headers.authorization.replace('Bearer ', '');

		if (!token) {
			return res.status(401).send({
				error: 'You must be logged in to perform that action'
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const admin = await Admin.findOne({
			_id: decoded._id
		});

		if (!admin) {
			return res.status(404).send({
				error: 'Invalid credentials'
			});
		}

		if (admin.role !== 'admin') {
			return res.status(403).send({
				error:
					'Unable to access this resource with current logged in user.'
			});
		}

		req.token = token;
		req.admin = admin;

		next();
	} catch (e) {
		console.log(e);
	}
};

module.exports = adminAuth;
