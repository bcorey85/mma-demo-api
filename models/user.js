const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const seasonStatsSchema = new mongoose.Schema({
	season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season' },
	seasonNumber: Number,
	cardStats: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Card' } ]
});

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [ true, 'Please add a first name' ],
		trim: true
	},
	fightName: {
		type: String,
		required: [ true, 'Please add a fight name' ],
		trim: true
	},
	lastName: {
		type: String,
		required: [ true, 'Please add a last name' ],
		trim: true
	},
	email: {
		type: String,
		required: [ true, 'Please add a email' ],
		trim: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			'Please add a valid email'
		]
	},
	password: {
		type: String,
		required: [ true, 'Please enter a password' ],
		trim: true,
		minlength: 6,
		select: false
	},
	role: {
		type: String,
		default: 'user'
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now
	},
	bids: [ { type: mongoose.Schema.Types.ObjectId, ref: 'bid' } ],
	seasonStats: [ seasonStatsSchema ]
});

userSchema.index(
	{
		fightName: 1
	},
	{
		unique: true
	}
);

userSchema.index(
	{
		email: 1
	},
	{
		unique: true
	}
);

userSchema.pre('save', async function(next) {
	const user = this;

	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8); // 8 - amount of hashes
	}

	next();
});

userSchema.statics.login = async (email, password) => {
	try {
		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			throw new Error('Unable to Log In - Invalid Credentials');
		}
		const passMatch = await bcrypt.compare(
			password.toString(),
			user.password
		);

		if (!passMatch) {
			throw new Error('Unable to Log In - Invalid Credentials');
		}

		return user;
	} catch (e) {
		console.log(e);
	}
};

userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign(
		{ _id: user._id.toString(), role: user.role },
		process.env.JWT_SECRET,
		{
			expiresIn: '2h'
		}
	);

	return token;
};

userSchema.methods.generateResetPasswordToken = function() {
	// Generate hashed token with node crypto package
	const resetToken = crypto.randomBytes(20).toString('hex');
	const hashedToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// Add token to user with expire date in 10 mins
	this.resetPasswordToken = hashedToken;
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

userSchema.methods.updateUserNames = async function(newFightName, newLastName) {
	const user = this;

	try {
		// Update username on all season leaderboards
		const seasonIDs = user.seasonStats.map(season => season.season);
		const seasons = await this.model('Season')
			.find({ _id: [ ...seasonIDs ] })
			.populate({
				path: 'cards',
				model: 'Card'
			});

		seasons.forEach(async season => {
			const leaderBoardResult = season.sideBar.leaderBoard.filter(
				player => player.user.toString() === user._id.toString()
			);

			if (leaderBoardResult.length > 0) {
				leaderBoardResult[0].fightName = newFightName;
				leaderBoardResult[0].lastName = newLastName;
				await season.save();
			} else {
				return;
			}
		});

		// Update username on all card results cards
		const cardIDs = user.seasonStats
			.map(season => season.cardStats.map(card => card))
			.flat();

		const cards = await this.model('Card').find({ _id: [ ...cardIDs ] });

		cards.forEach(async card => {
			const cardResult = card.resultsCard.filter(
				player => player.user.toString() === user._id.toString()
			);

			if (cardResult.length > 0) {
				cardResult[0].fightName = newFightName;
				cardResult[0].lastName = newLastName;

				await card.save();
			} else {
				return;
			}
		});
	} catch (error) {
		console.log(error);
	}
};

userSchema.methods.removeBids = async function(bidsArr) {
	for (const bid of bidsArr) {
		await bid.remove();
	}
};

userSchema.methods.removeUserFromCards = async function(cardsArr) {
	const user = this;
	const userID = user._id;

	for (const card of cardsArr) {
		for (const fight of card.fights) {
			const filtered1 = fight.fighter1Bids.filter(
				bid => bid.user.toString() !== userID.toString()
			);
			const filtered2 = fight.fighter2Bids.filter(
				bid => bid.user.toString() !== userID.toString()
			);

			fight.fighter1Bids = filtered1;
			fight.fighter2Bids = filtered2;
		}

		// Remove from results card
		const filtered = card.resultsCard.filter(
			user => user.user.toString() !== userID.toString()
		);

		card.resultsCard = filtered;
		await card.save();
	}
};

userSchema.methods.removeUserFromSeasons = async function(seasonsArr) {
	const user = this;
	const userID = user._id;
	for (const season of seasonsArr) {
		const filtered = season.sideBar.leaderBoard.filter(
			user => user.user.toString() !== userID.toString()
		);

		season.sideBar.leaderBoard = filtered;
		await season.save();
	}
};

userSchema.pre('remove', async function(next) {
	const user = this;
	const userID = user._id;

	//Delete all bids & run pre remove middleware
	const bids = await this.model('Bid').find({ user: userID });
	await user.removeBids(bids);
	// bids.forEach(async bid => await bid.remove());

	//Delete user from card results cards and bids from fighter bids
	const cardIDs = user.seasonStats.map(season => season.cardStats).flat();
	const cards = await this.model('Card')
		.find({ _id: [ ...cardIDs ] })
		.populate({
			path: 'fights.fighter1Bids',
			model: 'Bid'
		})
		.populate({
			path: 'fights.fighter2Bids',
			model: 'Bid'
		});

	await user.removeUserFromCards(cards);

	//Delete user from season leaderboards
	const seasonIDs = user.seasonStats.map(season => season.season);
	const seasons = await this.model('Season').find({ _id: [ ...seasonIDs ] });

	await user.removeUserFromSeasons(seasons);

	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
