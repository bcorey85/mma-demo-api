const { deleteBids } = require('./deleteBids');
const { getBidsByFightId } = require('./getBidsByFightId');
const { getPlayerListByCardId } = require('./getPlayerListByCardId');
const { updateBids } = require('./updateBids');

module.exports = {
	deleteBids,
	getBidsByFightId,
	getPlayerListByCardId,
	updateBids
};
