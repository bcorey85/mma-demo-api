function capitalizeFirstLetters(str) {
	return str.toLowerCase().replace(/^\w|\s\w/g, function(letter) {
		return letter.toUpperCase();
	});
}

module.exports = capitalizeFirstLetters;
