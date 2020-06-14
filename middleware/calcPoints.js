const calcPoints = (odds, bid, outcome) => {
	outcome = outcome.toLowerCase();
	bid = Math.abs(bid);

	if (outcome === 'l') {
		return -bid;
	}

	if (odds > 0 && outcome === 'w') {
		return Math.round((odds / 100 + 1) * bid - bid);
	} else if (odds < 0 && outcome === 'w') {
		return Math.round((-100 / odds + 1) * bid - bid);
	} else {
		return null;
	}
};

module.exports = {
	calcPoints
};
