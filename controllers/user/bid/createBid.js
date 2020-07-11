const User = require('../../../models/user');
const Card = require('../../../models/card');
const Bid = require('../../../models/bid');

const createBid = async (req, res) => {
	if (!req.body.bids || req.body.bids.length === 0) {
		return res.status(404).send({
			error: 'Please submit required bids'
		});
	}

	const { cardNumber, seasonNumber } = req.body.bids[0];
	const bids = req.body.bids;

	const { userID } = req.params;

	try {
		const card = await Card.findOne({
			cardNumber: cardNumber,
			seasonNumber: seasonNumber
		});

		if (!card) {
			return res.status(404).send({
				error:
					'Unable to locate that card. Please check your submission.'
			});
		}

		const user = await User.findOne({ _id: userID });

		if (!user) {
			return res.status(404).send({
				error:
					'Unable to locate that user. Please check your submission.'
			});
		}

		const newBids = bids.map(bid => {
			return {
				user: userID,
				seasonNumber,
				cardNumber,
				fightNumber: bid.fightNumber,
				bid: bid.bid,
				fighter: bid.fighter,
				moneyLine: bid.moneyLine
			};
		});
		// Create new bids and push to user/card bid arrays
		const bidIds = [];
		Bid.create(newBids, async (error, bids) => {
			try {
				if (error && error.code === 11000) {
					throw new Error('Bids already exist for this fight');
				} else if (error) {
					throw new Error(
						'An unknown error occurred during bid creation.'
					);
				}

				bids.forEach(bid => {
					user.bids.push(bid._id);
					bidIds.push(bid._id);
					// Push bid to correct fighter's bids on card
					const currentFight = card.fights.filter(
						fight => fight.fightNumber === bid.fightNumber
					)[0];

					if (currentFight.fighter1.name === bid.fighter) {
						currentFight.fighter1Bids.push(bid._id);
					} else {
						currentFight.fighter2Bids.push(bid._id);
					}
				});
				await user.save();
				await card.save();

				// Push card ref to user
				const currentSeasonStats = user.seasonStats.filter(
					season => season.seasonNumber === seasonNumber
				)[0];

				currentSeasonStats.cardStats.push(card._id);
				await user.save();

				// Add user to card results
				const pointsSpent = newBids
					.map(bid => bid.bid)
					.reduce((acc, cur) => acc + cur);

				card.resultsCard.push({
					user: user._id,
					bids: bidIds,
					fightName: user.fightName,
					lastName: user.lastName,
					correctPicks: null,
					points: null,
					pointsSpent: pointsSpent,
					adjustments: null,
					adjustedPoints: null
				});

				await card.save();

				res.status(201).send({ message: 'Bids created successfully.' });
			} catch (error) {
				return res.status(409).send({
					error: error.message
				});
			}
		});
	} catch (error) {
		console.log(error);

		return res.status(500).send({
			error:
				'An unknown error occured. Please contact a league developer for support'
		});
	}
};

module.exports = { createBid };
