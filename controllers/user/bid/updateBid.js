const User = require('../../../models/user');
const Card = require('../../../models/card');
const Bid = require('../../../models/bid');

const updateBid = async (req, res) => {
	const { cardNumber, seasonNumber } = req.body.bids[0];
	const bids = req.body.bids;

	const { userID } = req.params;

	try {
		const card = await Card.findOne({
			cardNumber: cardNumber,
			seasonNumber: seasonNumber
		})
			.populate({
				path: 'fights.fighter1Bids',
				model: Bid
			})
			.populate({
				path: 'fights.fighter2Bids',
				model: Bid
			});

		if (!card) {
			return res.status(404).send({
				error:
					'Unable to locate that card. Please check your submission.'
			});
		}

		const user = await User.findOne({ _id: userID }).populate({
			path: 'bids',
			model: Bid
		});

		if (!user) {
			return res.status(404).send({
				error:
					'Unable to locate that user. Please check your submission.'
			});
		}

		// Update bids
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

		// Delete old bids & remove from user bid array
		await Bid.deleteMany({
			seasonNumber,
			cardNumber,
			user: userID
		});
		user.bids = user.bids.filter(
			existingBid =>
				!(
					existingBid.seasonNumber === seasonNumber &&
					existingBid.cardNumber === cardNumber
				)
		);

		await user.save();

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

				// Add user to card results
				const pointsSpent = newBids
					.map(bid => bid.bid)
					.reduce((acc, cur) => acc + cur);

				// Filter existing player results & new
				card.resultsCard = card.resultsCard.filter(
					player => player.user.toString() !== user._id.toString()
				);
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

				res.status(200).send({ message: 'Bids updated successfully.' });
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

module.exports = { updateBid };
