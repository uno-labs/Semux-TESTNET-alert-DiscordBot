'use strict';

// Сортировка по голосам от большего к меньшему
function compareObjects(a, b) {
	if (a.votes < b.votes) return 1;
	if (a.votes > b.votes) return -1;
	return 0;
}

// Отображение чисел по разрядам "x xxx xxxx.xx"
function numberWithSpaces(x) {
	const parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	return parts.join('.');
}

// Выравнивание в столбце тыблицы по правому краю
function numberAlignRight(str) {
	while (str.length < 14) {
		str = ' ' + str;
	}
	return str;
}

// hex to text
function hexToString(hex) {
	let string = '';
	for (let i = 2; i < hex.length; i += 2) {
		string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}
	return string;
}

module.exports = {
	compareObjects, numberWithSpaces, numberAlignRight, hexToString,
};