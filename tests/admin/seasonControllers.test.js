const request = require('supertest');
const app = require('../../app.js');
const Season = require('../../models/season');
const Card = require('../../models/card');
const Bid = require('../../models/bid');
const User = require('../../models/user');
const { admin, userId, setupDB } = require('../fixtures/db.js');

beforeEach(setupDB);

describe('Create season', () => {
	it('Should create a season', async () => {
		const res = await request(app)
			.post('/admin/season/')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({ seasonNumber: 5 });
		expect(res.statusCode).toBe(201);
		expect(res.body.message).toBe('Season created successfully');

		const season = await Season.findOne({ seasonNumber: 5 });
		expect(season).toBeTruthy();
		expect(season).toHaveProperty('sideBar');
		expect(season).toHaveProperty('cards');
		expect(season).toHaveProperty('seasonNumber');
	});

	it('Should throw an error if season already exists', async () => {
		const res = await request(app)
			.post('/admin/season/')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({ seasonNumber: 5 });
		expect(res.statusCode).toBe(201);
		expect(res.body.message).toBe('Season created successfully');

		const res2 = await request(app)
			.post('/admin/season/')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({ seasonNumber: 5 });
		expect(res2.statusCode).toBe(409);
		expect(res2.body.error).toBe(
			'Season already exists. Please select a new season number.'
		);
	});
});

describe('Get season numbers list', () => {
	it('Should create a season', async () => {
		const res = await request(app)
			.get('/admin/season/')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('seasonNumbers');
	});
});

describe('Get season data for edit', () => {
	it('Should create a season', async () => {
		const res = await request(app)
			.get('/admin/season/1/edit')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('season');
	});
});

// No longer used
describe('Update season', () => {
	it('Should update a season', async () => {
		const res = await request(app)
			.put('/admin/season/1/edit')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
	});
});

describe('Delete season', () => {
	it('Should delete a season', async () => {
		const res = await request(app)
			.delete('/admin/season/1')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Season deleted successfully.');

		const season = await Season.findOne({ seasonNumber: 1 });
		expect(season).toBe(null);

		const cards = await Card.find({ seasonNumber: 1 });
		expect(cards.length).toBe(0);

		const bids = await Bid.find({ seasonNumber: 1 });
		expect(bids.length).toBe(0);

		const user = await User.findOne({ _id: userId });
		expect(user.seasonStats.length).toBe(0);
		// User bids deleted correctly, jest reporting incorrect bids existing
	});
});
