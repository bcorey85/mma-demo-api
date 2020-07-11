const Season = require('../../models/season');
const Card = require('../../models/card');

const pastCards = async (req, res) => {
	try {
		const seasons = await Season.find().populate({
			path: 'cards',
			model: Card
		});
		const seasonNumbers = seasons.map(season => season.seasonNumber);
		const seasonObject = seasonNumbers
			.map((number, index) => {
				if (seasons[index].seasonNumber === number) {
					const cardNumbers = seasons[index].cards
						.map(card => card.cardNumber)
						.sort((a, b) => a - b);
					return {
						season: number,
						cards: cardNumbers
					};
				}
			})
			.sort((a, b) => a.season - b.season);

		res.send({ seasonObject });
	} catch (e) {
		res.send(e);
	}
};

module.exports = { pastCards };
