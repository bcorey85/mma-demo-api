//Season
const sortPoints = array => {
	if (!array) {
		return undefined;
	}

	return array.sort((a, b) => {
		return b.points - a.points;
	});
};

//Season
const cardCode = (seasonID, cardID) => {
	return `s${seasonID}c${cardID}`;
};

//Season
const createPlayersArray = array => {
	return array
		.filter(player => {
			return player.fightName != '' && player.lastName != '';
		})
		.map(player => {
			return {
				fightName: player.fightName,
				lastName: player.lastName,
				correctPicks: null,
				points: null
			};
		});
};

//Season
const createSeasonObject = (seasonNumber, playersArray) => {
	return {
		seasonNumber: seasonNumber,
		sideBar: {
			leaderBoard: playersArray,
			winTotals: {
				cardTotals: [
					{
						favorite: null,
						underdog: null
					},
					{
						favorite: null,
						underdog: null
					},
					{
						favorite: null,
						underdog: null
					},
					{
						favorite: null,
						underdog: null
					}
				]
			}
		}
	};
};

//Card
const createResultsCardArray = array => {
	return array.map(player => {
		return {
			fightName: player.fightName,
			lastName: player.lastName,
			points: null
		};
	});
};

//Card
const createCardObject = (seasonID, cardID, fights, resultsCardArray) => {
	return {
		cardCode: cardCode(seasonID, cardID),
		cardNumber: cardID,
		seasonNumber: seasonID,
		fights: fights,
		resultsCard: resultsCardArray
	};
};

//Season
const createSidebarObject = (
	leaderBoardArray,
	cardTotalsArray,
	totalObject
) => {
	return {
		leaderBoard: sortPoints(leaderBoardArray),
		winTotals: {
			cardTotals: cardTotalsArray,
			total: totalObject
		}
	};
};

//Card
const createFightBidsArray = array => {
	return array
		.map(bid => {
			const nameSplit = bid.name.split(':');
			return {
				fightName: nameSplit[0],
				lastName: nameSplit[1],
				bid: bid.bid
			};
		})
		.filter(bid => {
			return (
				(bid.fightName != null || undefined) &&
				(bid.lastName != null || undefined)
			);
		});
};

module.exports = {
	sortPoints,
	cardCode,
	createPlayersArray,
	createResultsCardArray,
	createFightBidsArray,
	createSeasonObject,
	createCardObject,
	createSidebarObject
};
