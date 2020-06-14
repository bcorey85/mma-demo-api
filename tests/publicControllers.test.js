const request = require('supertest');
const app = require('../app.js');
const { setupDB } = require('./fixtures/db.js');
const User = require('../models/user');

beforeEach(setupDB);

describe('Get Card', () => {
	it('Should return current card', async () => {
		const res = await request(app).get('/');
		expect(res.statusCode).toEqual(200);
		expect(res.body.cardData.seasonNumber).toBe(1);
		expect(res.body.cardData.cardNumber).toBe(1);
		expect(res.body.showBids).toBe(true);
	});

	it('Should return specified card', async () => {
		const res = await request(app).get('/season/1/card/2');
		expect(res.statusCode).toEqual(200);
		expect(res.body.cardData.seasonNumber).toBe(1);
		expect(res.body.cardData.cardNumber).toBe(2);
		expect(res.body.showBids).toBe(true);
	});
});

describe('Past Cards', () => {
	it('Should return a list of past cards', async () => {
		const res = await request(app).get('/pastcards');
		expect(res.statusCode).toEqual(200);
		expect(res.body.seasonObject.length).toBeGreaterThan(0);
		expect(res.body.seasonObject[0]).toEqual({
			cards: [ 1, 2 ],
			season: 1
		});
	});
});

describe('Signup', () => {
	it('Should register a new user', async () => {
		const res = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		});
		expect(res.statusCode).toEqual(201);
	});

	it('Should throw error for wrong invite code', async () => {
		const res = await request(app).post('/signup').send({
			inviteCode: 'invitecode',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body.error).toBe(
			'Please contact a league developer for support'
		);
	});

	it('Should throw error for missing inputs', async () => {
		const res1 = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: '',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		});
		expect(res1.statusCode).toEqual(400);
		expect(res1.body.error).toBe('Please check required inputs');

		const res2 = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: '',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		});

		expect(res2.statusCode).toEqual(400);
		expect(res2.body.error).toBe('Please check required inputs');

		const res3 = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: '',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		});

		expect(res3.statusCode).toEqual(400);
		expect(res3.body.error).toBe('Please check required inputs');

		const res4 = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: '',
			email: 'bob@gmail.com',
			password: 123456
		});

		expect(res4.statusCode).toEqual(400);
		expect(res4.body.error).toBe('Please check required inputs');

		const res5 = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: '',
			password: 123456
		});

		expect(res5.statusCode).toEqual(400);
		expect(res5.body.error).toBe('Please check required inputs');

		const res6 = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: ''
		});

		expect(res6.statusCode).toEqual(400);
		expect(res6.body.error).toBe('Please check required inputs');
	});

	it('Should throw error for duplicate fightName', async () => {
		const res = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		});

		const res2 = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob2@gmail.com',
			password: 123456
		});
		expect(res2.statusCode).toEqual(409);
		expect(res2.body.error).toBe(
			'A user is already registered with that Fight Name'
		);
	});

	it('Should throw error for duplicate email', async () => {
		const res = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer2',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		});

		const res2 = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		});
		expect(res2.statusCode).toEqual(409);
		expect(res2.body.error).toBe(
			'A user is already registered with that Email'
		);
	});

	it('Should throw error for invalid email', async () => {
		const res = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob',
			password: 123456
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body.error).toBe('Please enter a valid email');
	});

	it('Should throw error for invalid password', async () => {
		const res = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob',
			password: 12345
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body.error).toBe('Password must be at least 6 characters');
	});

	it('Should check for profanity in fight name', async () => {
		const res = await request(app).post('/signup').send({
			inviteCode: 'kcmma64114',
			firstName: 'Bob',
			fightName: 'Bob the Ass',
			lastName: 'Jones',
			email: 'bob',
			password: 123456
		});
		expect(res.statusCode).toEqual(400);
		expect(res.body.error).toBe(
			'Invalid Submission: Clean up your language fool!'
		);
	});
});

describe('Login', () => {
	it('Should allow user to login with existing password', async () => {
		const user = await new User({
			firstName: 'Bob',
			fightName: 'Bob the Destroyer',
			lastName: 'Jones',
			email: 'bob@gmail.com',
			password: 123456
		}).save();

		const res = await request(app).post('/login').send({
			email: 'bob@gmail.com',
			password: 123456
		});

		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Login Successful');
		expect(res.body.token).toBeTruthy();
		expect(res.body.userId).toBeTruthy();
		expect(res.body.isAdmin).toBe(false);
	});
});

describe('Forgot Password', () => {
	// To do
});

describe('Reset Password', () => {
	// To do
});
