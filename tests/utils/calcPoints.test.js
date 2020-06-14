const calcPoints = require('../../utils/calcPoints');

describe('All point calculations correct', () => {
	it('Should return negative bid value for loss', () => {
		const odds = 500;
		const bid = 100;
		const outcome = 'l';
		const points = calcPoints(odds, bid, outcome);
		expect(points).toBe(-100);
	});

	it('Should return correct points for win', () => {
		const odds = 500;
		const bid = 100;
		const outcome = 'w';
		const points = calcPoints(odds, bid, outcome);
		expect(points).toBe(500);
	});

	it('Should return null if input is incorrect or missing', () => {
		const odds = 'hi';
		const bid = 100;
		const outcome = '';
		const points = calcPoints(odds, bid, outcome);
		expect(points).toBe(null);
	});
});
