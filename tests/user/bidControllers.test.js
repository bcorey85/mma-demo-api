const request = require('supertest');
const app = require('../../app.js');
const { userId, userAuthToken, setupDB } = require('../fixtures/db.js');

beforeEach(setupDB);
const bids = [
	{
		seasonNumber: 1,
		cardNumber: 2,
		fightNumber: 1,
		bid: 75,
		fighter: 'Max Holloway',
		moneyLine: '-380'
	},
	{
		seasonNumber: 1,
		cardNumber: 2,
		fightNumber: 2,
		bid: 100,
		fighter: 'Cris Cyborg',
		moneyLine: '-700'
	},
	{
		seasonNumber: 1,
		cardNumber: 2,
		fightNumber: 3,
		bid: 150,
		fighter: 'Niko Price',
		moneyLine: '290'
	},
	{
		seasonNumber: 1,
		cardNumber: 1,
		fightNumber: 4,
		bid: 500,
		fighter: 'Olivier Aubin-Mercier',
		moneyLine: '170'
	}
];

const updatedBids = [
	{
		seasonNumber: 1,
		cardNumber: 1,
		fightNumber: 1,
		bid: 150,
		fighter: 'Max Holloway',
		moneyLine: '-380'
	},
	{
		seasonNumber: 1,
		cardNumber: 1,
		fightNumber: 2,
		bid: 150,
		fighter: 'Cris Cyborg',
		moneyLine: '-700'
	},
	{
		seasonNumber: 1,
		cardNumber: 1,
		fightNumber: 3,
		bid: 200,
		fighter: 'Niko Price',
		moneyLine: '290'
	},
	{
		seasonNumber: 1,
		cardNumber: 1,
		fightNumber: 4,
		bid: 100,
		fighter: 'Olivier Aubin-Mercier',
		moneyLine: '170'
	}
];

describe('Create Bids', () => {
	it('Create bids for specified card', async () => {
		const res = await request(app)
			.post(`/user/${userId}/bid`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({ bids });
		expect(res.statusCode).toBe(201);
		expect(res.body.message).toBe('Bids created successfully.');
	});

	it('Should throw error if no bids are submitted', async () => {
		const res = await request(app)
			.post(`/user/${userId}/bid`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({});
		expect(res.statusCode).toBe(404);
		expect(res.body.error).toBe('Please submit required bids');
	});

	it('Should throw error if duplicate bids exist', async () => {
		const res = await request(app)
			.post(`/user/${userId}/bid`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({ bids });
		expect(res.statusCode).toBe(201);
		expect(res.body.message).toBe('Bids created successfully.');

		const res2 = await request(app)
			.post(`/user/${userId}/bid`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({ bids });
		expect(res2.statusCode).toBe(409);
		expect(res2.body.error).toBe('Bids already exist for this fight');
	});
});

describe('Update Bids', () => {
	it('Should update bids', async () => {
		const res = await request(app)
			.put(`/user/${userId}/bid`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({ bids: updatedBids });
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Bids updated successfully.');
	});
});
