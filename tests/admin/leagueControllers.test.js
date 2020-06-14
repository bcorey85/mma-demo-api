const request = require('supertest');
const app = require('../../app.js');
const League = require('../../models/league');
const { admin, setupDB } = require('../fixtures/db.js');

beforeEach(setupDB);

describe('Get league', () => {
	it('Should return current league', async () => {
		const res = await request(app)
			.get('/admin/league')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('league');
		expect(res.body).toHaveProperty('seasonNumbers');
		expect(res.body).toHaveProperty('cardNumbers');
	});
});

describe('Update league', () => {
	it('Should update active card and season', async () => {
		const res = await request(app)
			.put('/admin/league')
			.send({
				activeCard: 2,
				activeSeason: 2,
				activeSeasonSignupOpen: true,
				activeCardBidsOpen: true,
				showBids: true
			})
			.set('Authorization', `Bearer ${admin.token}`);

		const league = await League.findOne();

		expect(res.statusCode).toEqual(200);
		expect(res.body.message).toBe('League update successful');
		expect(league.activeCard.season).toBe(2);
		expect(league.activeCard.card).toBe(2);
		expect(league.activeSeason).toBe(2);
		expect(league.activeSeasonSignupOpen).toBe(true);
		expect(league.activeCardBidsOpen).toBe(true);
		expect(league.showBids).toBe(true);
	});
});
