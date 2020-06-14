const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
	adminName: {
		type: String,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 6,
		select: false
	},
	role: {
		type: String,
		default: 'admin'
	},
	token: {
		type: String
	}
});

adminSchema.pre('save', async function(next) {
	const admin = this;

	if (admin.isModified('password')) {
		admin.password = await bcrypt.hash(admin.password, 8); // 8 - amount of hashes
	}

	next();
});

adminSchema.statics.login = async (adminName, password) => {
	try {
		const admin = await Admin.findOne({ adminName }).select('+password');

		if (!admin) {
			throw new Error('Unable to Log In - Invalid Credentials');
		}
		const passMatch = await bcrypt.compare(password, admin.password);

		if (!passMatch) {
			throw new Error('Unable to Log In - Invalid Credentials');
		}

		return admin;
	} catch (e) {
		console.log(e);
	}
};

adminSchema.methods.generateAuthToken = async function() {
	const admin = this;

	const token = jwt.sign(
		{ _id: admin._id.toString() },
		process.env.JWT_SECRET,
		{
			expiresIn: '2h'
		}
	);
	admin.token = token;
	// admin.tokens = admin.tokens.concat({ token });
	await admin.save();

	return token;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
