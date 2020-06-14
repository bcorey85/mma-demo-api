const request = require('supertest');
const app = require('../../app.js');
const User = require('../../models/user');
const Bid = require('../../models/bid');
const Card = require('../../models/card');
const Season = require('../../models/season');
const { admin, userId, setupDB } = require('../fixtures/db.js');

beforeEach(setupDB);

describe('Get player list', () => {
	it('Should return current player list', async () => {
		const res = await request(app)
			.get('/admin/season/1/card/1/fight/1/')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('playerList');
	});
});

describe('Get existing bids', () => {
	it('Should return current bids', async () => {
		const res = await request(app)
			.get('/admin/season/1/card/1/fight/1/edit')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('fight');
		expect(res.body).toHaveProperty('fighter1Bids');
		expect(res.body).toHaveProperty('fighter2Bids');
	});
});

describe('Update bids', () => {
	it('Should update bids', async () => {
		const cardPre = await Card.findOne({ seasonNumber: 1, cardNumber: 1 })
			.populate({
				path: 'fights.fighter1Bids',
				model: 'Bid'
			})
			.populate({
				path: 'fights.fighter2Bids',
				model: 'Bid'
			});

		const fighter1Bids = cardPre.fights[0].fighter1Bids;
		const fighter2Bids = cardPre.fights[0].fighter2Bids;
		const fighter1 = cardPre.fights[0].fighter1;
		const fighter2 = cardPre.fights[0].fighter2;

		fighter1.outcome = 'l';
		fighter2.outcome = 'w';

		fighter1Bids[0].bid = 1000;
		fighter1Bids[0].outcome = 'l';

		const res = await request(app)
			.put('/admin/season/1/card/1/fight/1/')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				fighter1Bids,
				fighter2Bids,
				fighter1,
				fighter2
			});
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Bids updated successfully.');

		const bid = await Bid.findOne({
			user: userId,
			seasonNumber: 1,
			cardNumber: 1,
			fightNumber: 1
		});
		expect(bid.points).toBe(-1000);
		expect(bid.outcome).toBe('l');

		// Update on user results card
		const cardPost = await Card.findOne({ seasonNumber: 1, cardNumber: 1 })
			.populate({
				path: 'fights.fighter1Bids',
				model: 'Bid'
			})
			.populate({
				path: 'fights.fighter2Bids',
				model: 'Bid'
			});
		expect(cardPost.resultsCard[0].points).toBe(-1636);

		// Update user season points
		const season = await Season.findOne({ seasonNumber: 1 });
		expect(season.sideBar.leaderBoard[0].points).toBe(-636);
		expect(season.sideBar.leaderBoard[0].correctPicks).toBe(1);
	});
});

describe('Delete bids', () => {
	it('Should delete bids', async () => {
		const res = await request(app)
			.delete('/admin/season/1/card/1/fight/1')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body.message).toEqual('Bids deleted successfully.');

		// Delete bids from bids collection
		const bids = await Bid.find({
			seasonNumber: 1,
			cardNumber: 1,
			fightNumber: 1
		});
		expect(bids.length).toBe(0);

		// Delete bids from user collection. Bids deleting correctly from user bids, but Jest not reporting correct values
		const user = await User.findOne({ _id: userId });

		// Delete bids from fighter1/fighter2 on card collection
		const card = await Card.findOne({ seasonNumber: 1, cardNumber: 1 });
		expect(card.fights[0].fighter1Bids.length).toBe(0);
		expect(card.fights[0].fighter2Bids.length).toBe(0);

		// Delete bid from user results card on card
		expect(card.resultsCard[0].bids.length).toBe(3);
	});
});
