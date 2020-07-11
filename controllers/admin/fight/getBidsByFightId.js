const Season = require('../../../models/season');
const Card = require('../../../models/card');
const Bid = require('../../../models/bid');

const getBidsByFightId = async (req, res) => {
	const { seasonID, cardID, fightID } = req.params;
	try {
		const card = await Card.findOne({
			cardCode: Card.cardCode(seasonID, cardID)
		});

		if (!card) {
			return res.status(404).send({ error: 'Unable to locate card.' });
		}

		const fight = card.fights[fightID - 1];

		const fighter1Bids = await Bid.find({
			seasonNumber: seasonID,
			cardNumber: cardID,
			fightNumber: fightID,
			fighter: fight.fighter1.name
		}).populate({
			path: 'user',
			select: 'fightName lastName'
		});

		const fighter2Bids = await Bid.find({
			seasonNumber: seasonID,
			cardNumber: cardID,
			fightNumber: fightID,
			fighter: fight.fighter2.name
		}).populate({
			path: 'user',
			select: 'fightName lastName'
		});

		return res.status(200).send({
			fight,
			fighter1Bids,
			fighter2Bids
		});
	} catch (e) {
		console.log(e);
		return res.status(500).send({
			error: 'Unable to update bids at this time, please try again later.'
		});
	}
};

module.exports = { getBidsByFightId };
