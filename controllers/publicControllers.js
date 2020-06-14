const crypto = require('crypto');
const Season = require('../models/season');
const Card = require('../models/card');
const League = require('../models/league');
const User = require('../models/user');

const { sendResetPassword } = require('../utils/sendEmail');
const capitalize = require('../utils/capitalize');
const profanityFilter = require('../utils/profanityFilter');

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
			}
		} else {
			if (cardHasResults) {
				showBids = true;
			} else {
				showBids = league.showBids;
			}
		}

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

const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.login(email, password);
		if (!user) {
			return res
				.status(401)
				.send({ error: 'Please check your login credentials.' });
		}

		const token = await user.generateAuthToken();
		res.setHeader('Authorization', 'Bearer ' + token);

		return res.status(200).send({
			message: 'Login Successful',
			token: token,
			userId: user.id,
			isAdmin: false
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			error:
				'An error occured during sign up. Please contact a league developer for support'
		});
	}
};

const signup = async (req, res) => {
	const { inviteCode, email, password } = req.body;

	let { firstName, fightName, lastName } = req.body;

	if (
		!inviteCode ||
		!firstName ||
		!fightName ||
		!lastName ||
		!email ||
		!password
	) {
		return res.status(400).send({ error: 'Please check required inputs' });
	}

	if (inviteCode !== process.env.INVITE_CODE) {
		return res
			.status(400)
			.send({ error: 'Please contact a league developer for support' });
	}

	firstName = capitalize(firstName);
	fightName = fightName.toUpperCase();
	lastName = capitalize(lastName);

	const profanityCheck = profanityFilter([ firstName, fightName, lastName ]);

	if (profanityCheck.length > 0) {
		return res.status(400).send({
			error: 'Invalid Submission: Clean up your language fool!'
		});
	}

	try {
		const user = await User.create({
			firstName,
			fightName,
			lastName,
			email,
			password
		});

		const token = await user.generateAuthToken();

		res.setHeader('Authorization', 'Bearer ' + token);

		return res.status(201).send({
			message: 'Login Successful',
			token: token,
			userId: user.id,
			isAdmin: false
		});
	} catch (error) {
		if (error.code === 11000) {
			const fightNameError = error.errmsg.match(/fightName/);
			const emailError = error.errmsg.match(/email/);

			if (fightNameError) {
				return res.status(409).send({
					error: 'A user is already registered with that Fight Name'
				});
			}
			if (emailError) {
				return res.status(409).send({
					error: 'A user is already registered with that Email'
				});
			}
		}

		if (error.errors.password) {
			if (error.errors.password.kind === 'minlength') {
				return res
					.status(400)
					.send({ error: 'Password must be at least 6 characters' });
			}

			if (error.errors.password.kind === 'required') {
				return res.status(400).send({ error: 'Password is required' });
			}
		}

		if (error.errors.email) {
			if (error.errors.email.kind === 'regexp') {
				return res
					.status(400)
					.send({ error: 'Please enter a valid email' });
			}

			if (error.errors.email.kind === 'required') {
				return res
					.status(400)
					.send({ error: 'Please enter a valid email' });
			}
		}

		if (error.errors.firstName) {
			if (error.errors.firstName.kind === 'required') {
				return res
					.status(400)
					.send({ error: 'Please enter a First Name' });
			}
		}

		if (error.errors.fightName) {
			if (error.errors.fightName.kind === 'required') {
				return res
					.status(400)
					.send({ error: 'Please enter a Fight Name' });
			}
		}

		if (error.errors.lastName) {
			if (error.errors.lastName.kind === 'required') {
				return res
					.status(400)
					.send({ error: 'Please enter a Last Name' });
			}
		}

		return res.status(500).send({
			error:
				'An error occured during sign up. Please contact a league developer for support'
		});
	}
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email }).select(
		'fightName lastName email'
	);

	if (!user) {
		return res
			.status(404)
			.send({ error: 'Unable to locate user with that email' });
	}

	const resetToken = user.generateResetPasswordToken();

	await user.save();

	try {
		await sendResetPassword(email, resetToken);
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			error:
				'An error occured during password reset. Please contact a league developer for support'
		});
	}

	res.status(200).send({ message: 'Password email sent' });
};

const resetPassword = async (req, res) => {
	const { resetToken } = req.params;
	const { password } = req.body;

	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() }
	});

	if (!user) {
		return res.status(404).send({
			error:
				'Invalid password reset token. Please initiate a new request.'
		});
	}

	if (!password || password.length < 6) {
		return res.status(404).send({
			error: 'Please enter a valid password'
		});
	}

	user.password = password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	const token = await user.generateAuthToken();

	await user.save();

	return res.status(200).send({
		message: 'Password reset successful',
		token: token,
		userId: user.id,
		isAdmin: false
	});
};

module.exports = {
	pastCards,
	getCard,
	login,
	signup,
	forgotPassword,
	resetPassword
};
