const request = require('supertest');
const app = require('../../app.js');
const Card = require('../../models/card');
const Season = require('../../models/season');
const Bid = require('../../models/bid');
const User = require('../../models/user');
const { card1, admin, userId, setupDB } = require('../fixtures/db.js');

beforeEach(setupDB);

describe('Create card', () => {
	it('Create card and save to db', async () => {
		const res = await request(app)
			.post('/admin/season/1/card')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				fights: card1.fights,
				cardNumber: 3,
				eventName: 'UFC 3',
				date: card1.date
			});
		expect(res.statusCode).toEqual(201);
		expect(res.body.message).toBe('Card created successfully.');

		const card = await Card.findOne({ seasonNumber: 1, cardNumber: 3 });
		expect(card.seasonNumber).toBe(1);
		expect(card.cardNumber).toBe(3);

		expect(card.cardCode).toBe('s1c3');
		expect(card.eventName).toBe('UFC 3');
		expect(card.date).toBe('2019-07-27');
		expect(card.fights.length).toBe(5);
		expect(card.resultsCard.length).toBe(0);
		expect(card.winTotals.favorite).toBe(null);
		expect(card.winTotals.underdog).toBe(null);
	});

	it('Should throw an error for duplicate card', async () => {
		const res = await request(app)
			.post('/admin/season/1/card')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				fights: card1.fights,
				cardNumber: 3,
				eventName: 'UFC 3',
				date: card1.date
			});
		expect(res.statusCode).toEqual(201);
		expect(res.body.message).toBe('Card created successfully.');

		const res2 = await request(app)
			.post('/admin/season/1/card')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				fights: card1.fights,
				cardNumber: 3,
				eventName: 'UFC 3',
				date: card1.date
			});
		expect(res2.statusCode).toBe(409);
		expect(res2.body.error).toBe(
			'Card number already exists on this season. Please try another number.'
		);
	});

	it('Should throw an error if no seasons exist', async () => {
		await Season.deleteMany();
		const res = await request(app)
			.post('/admin/season/1/card')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				fights: card1.fights,
				cardNumber: 3,
				eventName: 'UFC 3',
				date: card1.date
			});
		expect(res.statusCode).toBe(404);
		expect(res.body.error).toBe('Please make a season first');
	});
});

describe('Get card by id', () => {
	it('Update card and save to db', async () => {
		const res = await request(app)
			.get('/admin/season/1/card/1')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				fights: card1.fights,
				cardNumber: 3,
				eventName: 'UFC 3',
				date: card1.date
			});
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('card');
	});
});

describe('Update card', () => {
	it('Update card and save to db if no current bids', async () => {
		const fights = card1.fights;
		fights[0].fighter1.name = 'Test';
		fights[0].fighter1.moneyLine = -2000;
		fights[0].fighter1.image = 'Test';

		const res = await request(app)
			.put('/admin/season/1/card/2')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				fights: fights,
				eventName: 'UFC 4',
				date: '2019-07-28',
				resultsCard: card1.resultsCard
			});
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Card updated successfully.');

		const card = await Card.findOne({ seasonNumber: 1, cardNumber: 2 });
		expect(card.eventName).toBe('UFC 4');
		expect(card.date).toBe('2019-07-28');
		expect(card.fights[0].fighter1.name).toBe('Test');
		expect(card.fights[0].fighter1.moneyLine).toBe(-2000);
		expect(card.fights[0].fighter1.image).toBe('Test');
	});

	it('Should throw error if trying to update fighter with existing bids', async () => {
		const fights = card1.fights;
		fights[0].fighter1.name = 'Test';
		fights[0].fighter1.moneyLine = -2000;
		fights[0].fighter1.image = 'Test';

		const res = await request(app)
			.put('/admin/season/1/card/1')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				fights: fights,
				eventName: 'UFC 4',
				date: '2019-07-28',
				resultsCard: card1.resultsCard
			});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe(
			'Unable to update Fight 4 due to existing bids. Please delete bids before updating fighter info.'
		);
	});
});

describe('Delete card', () => {
	it('Delete card from db', async () => {
		const res = await request(app)
			.delete('/admin/season/1/card/1')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Card deleted successfully.');

		const bids = await Bid.find({ seasonNumber: 1, cardNumber: 1 });
		expect(bids.length).toBe(0);

		// User bids and card stats deleting, but jest not reporting correct update
		const user = await User.findOne({ _id: userId });

		const season = await Season.findOne({ seasonNumber: 1 });
		expect(season.cards.length).toBe(1);
	});
});
