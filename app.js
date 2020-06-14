const express = require('express');
const app = express();
const mongoose = require('mongoose');

const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
const publicRouter = require('./routes/public');
const adminRouter = require('./routes/admin/admin');
const userRouter = require('./routes/user/user');
const cardRouter = require('./routes/admin/cardRoutes');
const seasonRouter = require('./routes/admin/seasonRoutes');
const fightRouter = require('./routes/admin/fightRoutes');
const leagueRouter = require('./routes/admin/leagueRoutes');

// Security
app.use(cors());
app.use(mongoSanitize());
app.use(xss());
// app.use(
// 	rateLimit({
// 		windowMs: 15 * 60 * 1000,
// 		max: 200
// 	})
// );
app.use(hpp());

// Routers
app.use(publicRouter);
app.use(adminRouter);
app.use(userRouter);
app.use(cardRouter);
app.use(seasonRouter);
app.use(fightRouter);
app.use(leagueRouter);

// DB setup
const dbConnect = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		});
		// console.log('Connected to DB');
	} catch (error) {
		console.log(error);
	}
};

dbConnect();

module.exports = app;
