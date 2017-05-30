'use strict';

// Only instantiate BugHunterGame once
var BugHunterGame = BugHunterGame || {};

;(function (BugHunterGame) {

	BugHunterGame.changeDate = function (value, pathValues, indexNr) {
		console.log('changeDate', value, pathValues, indexNr);
		pathValues[indexNr] = value;
		var newPath = '/highscore/' + pathValues.join('/');
		document.location = newPath;
	};

}(BugHunterGame));
