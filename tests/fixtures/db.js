const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin');
const Bid = require('../../models/bid');
const Card = require('../../models/card');
const League = require('../../models/league');
const Season = require('../../models/season');
const User = require('../../models/user');

const adminId = new mongoose.Types.ObjectId();
const userId = new mongoose.Types.ObjectId();
const userAuthToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET);

const card1Id = new mongoose.Types.ObjectId();
const card2Id = new mongoose.Types.ObjectId();

const seasonId = new mongoose.Types.ObjectId();

const bid1Id = new mongoose.Types.ObjectId();
const bid2Id = new mongoose.Types.ObjectId();
const bid3Id = new mongoose.Types.ObjectId();
const bid4Id = new mongoose.Types.ObjectId();

const admin = {
	_id: adminId,
	role: 'admin',
	adminName: 'adminName',
	password: 'adminPassword',
	token: jwt.sign({ _id: adminId }, process.env.JWT_SECRET)
};

const league = {
	activeCard: {
		card: 1,
		season: 1
	},
	activeSeason: 1,
	activeSeasonSignupOpen: false,
	activeCardBidsOpen: false,
	showBids: false
};

const card1 = {
	_id: card1Id,
	cardCode: 's1c1',
	eventName: 'UFC 240',
	date: '2019-07-27',
	cardNumber: '1',
	seasonNumber: '1',
	fights: [
		{
			fightNumber: 1,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/1936_ALpdYg_96x96.png',
				name: 'Max Holloway',
				moneyLine: '-380',
				outcome: 'w'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/451_SERlOQ_96x96.png',
				name: 'Frankie Edgar',
				moneyLine: '300',
				outcome: 'l'
			},
			fighter1Bids: [ bid1Id ],
			fighter2Bids: []
		},
		{
			fightNumber: 2,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/1194_7o-l0A_96x96.png',
				name: 'Cris Cyborg',
				moneyLine: '-700',
				outcome: 'w'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/3258_TwYbjQ_96x96.png',
				name: 'Felicia Spencer',
				moneyLine: '475',
				outcome: 'l'
			},
			fighter1Bids: [ bid2Id ],
			fighter2Bids: []
		},
		{
			fightNumber: 3,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/2963_DqkHcg_96x96.png',
				name: 'Geoff Neal',
				moneyLine: '-365',
				outcome: 'w'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/2851_fj-IFw_96x96.png',
				name: 'Niko Price',
				moneyLine: '290',
				outcome: 'l'
			},
			fighter1Bids: [],
			fighter2Bids: [ bid3Id ]
		},
		{
			fightNumber: 4,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/2223_F_O0lQ_96x96.png',
				name: 'Olivier Aubin-Mercier',
				moneyLine: '170',
				outcome: 'l'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/3269_rU9nNQ_96x96.png',
				name: 'Arman Tsarukyan',
				moneyLine: '-230',
				outcome: 'w'
			},
			fighter1Bids: [ bid4Id ],
			fighter2Bids: []
		},
		{
			fightNumber: 5,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/3233_Ik5zyA_96x96.png',
				name: 'Marc-Andre Barriault',
				moneyLine: '135',
				outcome: 'l'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/2122_IOTyDA_96x96.png',
				name: 'Krzysztof Jotko',
				moneyLine: '-165',
				outcome: 'w'
			},
			fighter1Bids: [],
			fighter2Bids: []
		}
	],
	resultsCard: [
		{
			user: userId,
			fightName: 'Frank the Tank',
			lastName: 'Williams',
			bids: [ bid1Id, bid2Id, bid3Id, bid4Id ],
			correctPicks: 2,
			points: -634,
			pointsSpent: 825,
			adjustments: 0,
			adjustedPoints: -634
		}
	],
	winTotals: {
		favorite: 5,
		underdog: 0
	}
};

const card2 = {
	_id: card2Id,
	cardCode: 's1c2',
	eventName: 'UFC 241',
	date: '2019-07-28',
	cardNumber: '2',
	seasonNumber: '1',
	fights: [
		{
			fightNumber: 1,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/1936_ALpdYg_96x96.png',
				name: 'Max Holloway',
				moneyLine: '-380'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/451_SERlOQ_96x96.png',
				name: 'Frankie Edgar',
				moneyLine: '300'
			}
		},
		{
			fightNumber: 2,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/1194_7o-l0A_96x96.png',
				name: 'Cris Cyborg',
				moneyLine: '-700'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/3258_TwYbjQ_96x96.png',
				name: 'Felicia Spencer',
				moneyLine: '475'
			}
		},
		{
			fightNumber: 3,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/2963_DqkHcg_96x96.png',
				name: 'Geoff Neal',
				moneyLine: '-365'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/2851_fj-IFw_96x96.png',
				name: 'Niko Price',
				moneyLine: '290'
			}
		},
		{
			fightNumber: 4,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/2223_F_O0lQ_96x96.png',
				name: 'Olivier Aubin-Mercier',
				moneyLine: '170'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/3269_rU9nNQ_96x96.png',
				name: 'Arman Tsarukyan',
				moneyLine: '-230'
			}
		},
		{
			fightNumber: 5,
			fighter1: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/3233_Ik5zyA_96x96.png',
				name: 'Marc-Andre Barriault',
				moneyLine: '135'
			},
			fighter2: {
				image:
					'https://ssl.gstatic.com/onebox/media/sports/photos/ufc/2122_IOTyDA_96x96.png',
				name: 'Krzysztof Jotko',
				moneyLine: '-165'
			}
		}
	],
	resultsCard: [],
	winTotals: {
		favorite: null,
		underdog: null
	}
};

const season = {
	_id: seasonId,
	seasonNumber: 1,
	cards: [ card1Id, card2Id ],
	sideBar: {
		leaderBoard: [
			{
				user: userId,
				firstName: 'Frank',
				fightName: 'Frank the Tank',
				correctPicks: 2,
				initialPoints: 1000,
				points: 366
			}
		],
		winTotals: {
			cardTotals: [
				{
					favorite: 5,
					underdog: 0
				}
			],
			total: {
				favorite: 5,
				underdog: 0
			}
		}
	}
};

const user = {
	_id: userId,
	firstName: 'Frank',
	fightName: 'Frank the Tank',
	lastName: 'Williams',
	email: 'frank@gmail.com',
	password: '111111',
	bids: [ bid1Id, bid2Id, bid3Id, bid4Id ],
	seasonStats: [
		{
			season: seasonId,
			seasonNumber: 1,
			cardStats: [ card1Id ]
		}
	]
};

const bid1 = {
	_id: bid1Id,
	user: userId,
	seasonNumber: 1,
	cardNumber: 1,
	fightNumber: 1,
	bid: 75,
	fighter: 'Max Holloway',
	moneyLine: '-380',
	outcome: 'w',
	points: 20
};

const bid2 = {
	_id: bid2Id,
	user: userId,
	seasonNumber: 1,
	cardNumber: 1,
	fightNumber: 2,
	bid: 100,
	fighter: 'Cris Cyborg',
	moneyLine: '-700',
	outcome: 'w',
	points: 14
};

const bid3 = {
	_id: bid3Id,
	user: userId,
	seasonNumber: 1,
	cardNumber: 1,
	fightNumber: 3,
	bid: 150,
	fighter: 'Niko Price',
	moneyLine: '290',
	outcome: 'l',
	points: -150
};

const bid4 = {
	_id: bid4Id,
	user: userId,
	seasonNumber: 1,
	cardNumber: 1,
	fightNumber: 4,
	bid: 500,
	fighter: 'Olivier Aubin-Mercier',
	moneyLine: '170',
	outcome: 'l',
	points: -500
};

const setupDB = async () => {
	await Admin.deleteMany();
	await User.deleteMany();
	await League.deleteMany();
	await Season.deleteMany();
	await Card.deleteMany();
	await Bid.deleteMany();

	await new Admin(admin).save();
	await new User(user).save();
	await new League(league).save();
	await new Season(season).save();
	await new Card(card1).save();
	await new Card(card2).save();
	await new Bid(bid1).save();
	await new Bid(bid2).save();
	await new Bid(bid3).save();
	await new Bid(bid4).save();
};

module.exports = {
	admin,
	adminId,
	user,
	userId,
	userAuthToken,
	league,
	season,
	card1,
	card2,
	setupDB
};
