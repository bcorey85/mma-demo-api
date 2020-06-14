const trimNames = fights => {
	const trimmed = fights.map(fight => {
		if (fight.fighter1.name) {
			fight.fighter1.name = fight.fighter1.name.trim();
		}

		if (fight.fighter2.name) {
			fight.fighter2.name = fight.fighter2.name.trim();
		}

		return fight;
	});
	return trimmed;
};

module.exports = trimNames;
