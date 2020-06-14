const getBids = async (seasonID, fightID, fighterNames) => {
	const f1bids = await Bid.find({
		seasonNumber: seasonID,
		cardNumber: cardID,
		fightNumber: 1
	})
		.select('-seasonNumber -cardNumber -createdAt')
		.populate({
			path: 'userId',
			model: User,
			select: 'fightName lastName'
		});
	const f2bids = await Bid.find({
		seasonNumber: seasonID,
		cardNumber: cardID,
		fightNumber: 2
	})
		.select('-seasonNumber -cardNumber -createdAt')
		.populate({
			path: 'userId',
			model: User,
			select: 'fightName lastName'
		});
	const f3bids = await Bid.find({
		seasonNumber: seasonID,
		cardNumber: cardID,
		fightNumber: 3
	})
		.select('-seasonNumber -cardNumber -createdAt')
		.populate({
			path: 'userId',
			model: User,
			select: 'fightName lastName'
		});
	const f4bids = await Bid.find({
		seasonNumber: seasonID,
		cardNumber: cardID,
		fightNumber: 4
	})
		.select('-seasonNumber -cardNumber -createdAt')
		.populate({
			path: 'userId',
			model: User,
			select: 'fightName lastName'
		});
	const f5bids = await Bid.find({
		seasonNumber: seasonID,
		cardNumber: cardID,
		fightNumber: 5
	})
		.select('-seasonNumber -cardNumber -createdAt')
		.populate({
			path: 'userId',
			model: User,
			select: 'fightName lastName'
		});

	return;
};
