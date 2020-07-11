const { createSeason } = require('./createSeason');
const { getSeasonList } = require('./getSeasonList');
const { getSeasonById } = require('./getSeasonById');
const { updateSeason } = require('./updateSeason');
const { deleteSeason } = require('./deleteSeason');

module.exports = {
	createSeason,
	getSeasonList,
	getSeasonById,
	updateSeason,
	deleteSeason
};
