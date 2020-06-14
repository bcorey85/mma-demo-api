const request = require('supertest');
const app = require('../../app.js');
const User = require('../../models/user');
const { admin, userId, setupDB } = require('../fixtures/db.js');

beforeEach(setupDB);

describe('Admin login', () => {
	it('Should login admin', async () => {
		const res = await request(app)
			.post('/admin/login')
			.set('Authorization', `Bearer ${admin.token}`)
			.send({ adminName: 'adminName', password: 'adminPassword' });
		expect(res.statusCode).toBe(200);
	});
});

describe('Admin logout', () => {
	it('Should logout admin', async () => {
		const res = await request(app)
			.post('/admin/logout')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
	});
});

describe('Admin get user list', () => {
	it('Should get user list', async () => {
		const res = await request(app)
			.get('/admin/user/')
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('users');
		expect(res.body.users.length).toBeGreaterThan(0);
	});
});

describe('Admin get user by id', () => {
	it('Should get single user', async () => {
		const res = await request(app)
			.get(`/admin/user/${userId}`)
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('user');
		expect(res.body.user).toHaveProperty('firstName');
		expect(res.body.user).toHaveProperty('fightName');
		expect(res.body.user).toHaveProperty('lastName');
		expect(res.body.user).toHaveProperty('email');
		expect(res.body.user).toHaveProperty('seasonStats');
		expect(res.body.user).toHaveProperty('bids');
		expect(res.body.user.role).toBe('user');
	});
});

describe('Admin update user', () => {
	it('Should update user', async () => {
		const res = await request(app)
			.put(`/admin/user/${userId}`)
			.set('Authorization', `Bearer ${admin.token}`)
			.send({
				firstName: 'Frank2',
				fightName: 'Frank the Tank 2',
				lastName: 'Jones2'
			});
		expect(res.statusCode).toBe(200);
		expect(res.body.user.firstName).toBe('Frank2');
		expect(res.body.user.fightName).toBe('FRANK THE TANK 2');
		expect(res.body.user.lastName).toBe('Jones2');

		const user = await User.findOne({ _id: userId });
		expect(user.firstName).toBe('Frank2');
		expect(user.fightName).toBe('FRANK THE TANK 2');
		expect(user.lastName).toBe('Jones2');
	});
});

describe('Admin delete user', () => {
	it('Should delete user', async () => {
		const res = await request(app)
			.delete(`/admin/user/${userId}`)
			.set('Authorization', `Bearer ${admin.token}`);
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Delete request successful');

		const user = await User.findOne({ _id: userId });
		expect(user).toBe(null);
	});
});

describe('Send admin email', () => {
	// Todo
});
