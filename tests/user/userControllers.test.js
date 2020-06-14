const request = require('supertest');
const app = require('../../app.js');
const League = require('../../models/league');
const Season = require('../../models/season');
const User = require('../../models/user');
const { userId, userAuthToken, setupDB } = require('../fixtures/db.js');
const bcrypt = require('bcryptjs');

beforeEach(setupDB);

describe('Get user by id', () => {
	it('Gets user', async () => {
		const res = await request(app)
			.get(`/user/${userId}/`)
			.set('Authorization', `Bearer ${userAuthToken}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('userData');
		expect(res.body).toHaveProperty('leagueState');
		expect(res.body).toHaveProperty('seasonLeaderboardStats');
		expect(res.body).toHaveProperty('seasonCardStats');
		expect(res.body).toHaveProperty('currentUserBids');
	});
});

describe('Logout', () => {
	it('Logs user out', async () => {
		const res = await request(app)
			.post(`/logout/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`);
		expect(res.statusCode).toBe(200);
	});
});

describe('Season signup', () => {
	beforeEach(async () => {
		const league = await League.findOne();
		league.activeSeason = 2;
		await league.save();

		await new Season({ seasonNumber: 2 }).save();
	});
	it("Let's user signup if season is open", async () => {
		const league = await League.findOne();
		league.activeSeasonSignupOpen = true;
		await league.save();

		const res = await request(app)
			.post(`/user/${userId}/season/2/signup`)
			.set('Authorization', `Bearer ${userAuthToken}`);
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Season sign up complete!');
	});

	it('Throws error if league is closed for signup', async () => {
		const res = await request(app)
			.post(`/user/${userId}/season/2/signup`)
			.set('Authorization', `Bearer ${userAuthToken}`);
		expect(res.statusCode).toBe(422);
		expect(res.body.error).toBe(
			'Season 2 is not currently open for signup. Please contact a league develop for support.'
		);
	});
});

describe('Update user details', () => {
	it('Updates user details', async () => {
		const res = await request(app)
			.put(`/user/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({
				inputState: {
					email: 'frank2@gmail.com',
					password: 222222,
					firstName: 'Frank2',
					fightName: 'Frank the Tank 2',
					lastName: 'Jones2'
				}
			});
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('User details updated successfully');

		const user = await User.findOne({ _id: userId }).select('+password');
		expect(user.firstName).toBe('Frank2');
		expect(user.fightName).toBe('FRANK THE TANK 2');
		expect(user.lastName).toBe('Jones2');
		expect(user.email).toBe('frank2@gmail.com');
		expect(await bcrypt.compare('222222', user.password)).toBeTruthy();
	});

	it('Throws error if profanity detected', async () => {
		const res = await request(app)
			.put(`/user/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({
				inputState: {
					email: 'frank2@gmail.com',
					password: 222222,
					firstName: 'Frank2',
					fightName: 'Frank the Ass 2',
					lastName: 'Jones2'
				}
			});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe(
			'Invalid Submission: Clean up your language fool!'
		);
	});

	it('Throws error password too short', async () => {
		const res = await request(app)
			.put(`/user/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({
				inputState: {
					email: 'frank2@gmail.com',
					password: 22222,
					firstName: 'Frank2',
					fightName: 'Frank the Tank 2',
					lastName: 'Jones2'
				}
			});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Password must be at least 6 characters');
	});

	it('Throws error email is invalid', async () => {
		const res = await request(app)
			.put(`/user/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({
				inputState: {
					email: 'frank2',
					password: 222222,
					firstName: 'Frank2',
					fightName: 'Frank the Tank 2',
					lastName: 'Jones2'
				}
			});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Please enter a valid email');
	});

	it('Throws error email is missing', async () => {
		const res = await request(app)
			.put(`/user/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({
				inputState: {
					email: '',
					password: 222222,
					firstName: 'Frank2',
					fightName: 'Frank the Tank 2',
					lastName: 'Jones2'
				}
			});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Please enter a valid email');
	});

	it('Throws error firstName is missing', async () => {
		const res = await request(app)
			.put(`/user/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({
				inputState: {
					email: 'frank2@gmail.com',
					password: 222222,
					firstName: '',
					fightName: 'Frank the Tank 2',
					lastName: 'Jones2'
				}
			});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Please enter a First Name');
	});

	it('Throws error fightName is missing', async () => {
		const res = await request(app)
			.put(`/user/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({
				inputState: {
					email: 'frank2@gmail.com',
					password: 222222,
					firstName: 'Frank2',
					fightName: '',
					lastName: 'Jones2'
				}
			});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Please enter a Fight Name');
	});

	it('Throws error lastName is missing', async () => {
		const res = await request(app)
			.put(`/user/${userId}`)
			.set('Authorization', `Bearer ${userAuthToken}`)
			.send({
				inputState: {
					email: 'frank2@gmail.com',
					password: 222222,
					firstName: 'Frank2',
					fightName: 'Frank the Tank 2',
					lastName: ''
				}
			});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBe('Please enter a Last Name');
	});
});
