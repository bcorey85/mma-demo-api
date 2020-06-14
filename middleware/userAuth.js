const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
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

		const user = await User.findOne({
			_id: decoded._id
		});

		if (!user) {
			return res.status(404).send({
				error: 'Invalid credentials'
			});
		}

		if (user.role !== 'user') {
			res.status(403).send({
				error:
					'Unable to access this resource with current logged in user.'
			});
		}

		req.token = token;
		req.user = user;

		next();
	} catch (e) {
		console.log(e);
		if (e.message === 'jwt expired') {
			res.status(403).send({
				error: 'Your session has expired. Please log in again.'
			});
		}
	}
};

module.exports = userAuth;
