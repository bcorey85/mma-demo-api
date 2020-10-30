const Season = require('../../models/season');
const Card = require('../../models/card');
const League = require('../../models/league');

const calcShowBids = (req, cardHasResults, league) => {
	let showBids;
	if (req.params.seasonID && req.params.cardID) {
		const currentCardCode = Card.cardCode(
			req.params.seasonID,
			req.params.cardID
		);
		const activeCardCode = Card.cardCode(
			league.activeCard.season,
			league.activeCard.card
		);

		// Prevent user from going to direct route to see current bids
		if (currentCardCode !== activeCardCode) {
			showBids = true;
		} else if (cardHasResults) {
			showBids = true;
		}
	} else {
		if (cardHasResults) {
			showBids = true;
		} else {
			showBids = league.showBids;
		}
	}
	return showBids;
};

const getCard = async (req, res) => {
	try {
		const league = await League.findOne({});
		let card;
		let season;
		let seasonID;
		let cardID;

		if (league) {
			// If no params, show active card
			if (req.params.seasonID && req.params.cardID) {
				seasonID = req.params.seasonID;
				cardID = req.params.cardID;
			} else {
				seasonID = league.activeCard.season;
				cardID = league.activeCard.card;

				if (!seasonID || !cardID) {
					if (seasonID === 0 || cardID === 0) {
						return res.status(503).send({
							error: `Site is currently under maintenance. Please check back soon!`
						});
					}

					return res
						.status(404)
						.send({ error: 'Unable to locate selected card' });
				}
			}

			card = await Card.findOne({
				seasonNumber: seasonID,
				cardNumber: cardID
			})
				.populate({
					path: 'fights.fighter1Bids',
					select: '-createdAt -seasonNumber -cardNumber',
					populate: {
						path: 'user',
						select: 'fightName lastName'
					}
				})
				.populate({
					path: 'fights.fighter2Bids',
					select: '-createdAt -seasonNumber -cardNumber',
					populate: {
						path: 'user',
						select: 'fightName lastName'
					}
				});

			season = await Season.findOne({
				seasonNumber: seasonID
			});
		}

		if (!league || !card || !season) {
			return res
				.status(404)
				.send({ error: 'Unable to locate selected card' });
		}

		// Circumvent bug with mongoose sorting subproperty during populate
		if (card && card.fights.length > 0) {
			card.fights.forEach(fight => {
				fight.fighter1Bids.sort((a, b) => b.bid - a.bid);
				fight.fighter2Bids.sort((a, b) => b.bid - a.bid);
			});
		}

		//If no outcomes declared ('w'/'l'), show pointsSpent on results card
		const cardHasResults = !!card.fights.find(
			fight =>
				fight.fighter1.outcome === 'w' || fight.fighter1.outcome === 'l'
		);

		//Sort by points spent if no outcomes declared
		if (!cardHasResults) {
			Card.sortPoints(card.resultsCard, 'pointsSpent');
		} else {
			Card.sortPoints(card.resultsCard, 'adjustedPoints');
		}

		// Handle showing bids on past cards, but check league state before showing on active card
		const showBids = calcShowBids(req, cardHasResults, league);

		// Pagination
		let pagination = {};
		const totalCards = season.cards.length;
		if (cardID < totalCards) {
			pagination.next = {
				seasonID,
				cardID: parseInt(cardID) + 1
			};
		}

		if (cardID > 1) {
			pagination.prev = {
				seasonID,
				cardID: parseInt(cardID) - 1
			};
		}

		res.send({
			cardData: card,
			sidebar: season.sideBar,
			showBids: showBids,
			showPointsSpent: !cardHasResults,
			pagination
		});
	} catch (e) {
		console.log(e);
		res.status(500).send(e);
	}
};

module.exports = { getCard };
