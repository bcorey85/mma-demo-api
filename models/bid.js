const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	seasonNumber: {
		type: Number,
		required: true
	},
	cardNumber: {
		type: Number,
		required: true
	},
	fightNumber: {
		type: Number,
		required: true
	},
	bid: {
		type: Number,
		required: true
	},
	fighter: {
		type: String,
		required: true
	},
	moneyLine: {
		type: Number,
		required: true
	},
	outcome: {
		type: String,
		default: null
	},
	points: {
		type: Number,
		default: null
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

bidSchema.index(
	{
		seasonNumber: 1,
		cardNumber: 1,
		fightNumber: 1,
		user: 1
	},
	{
		unique: true
	}
);

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
