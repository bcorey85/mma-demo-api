const Filter = require('bad-words');
const filter = new Filter();

filter.addWords('is gay');

const profanityFilter = array => {
	const checks = array.map(word => {
		if (filter.isProfane(word)) {
			return word;
		}
	});

	return checks.filter(word => word !== undefined);
};

module.exports = profanityFilter;
