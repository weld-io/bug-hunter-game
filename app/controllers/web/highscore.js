'use strict';

var mongoose = require('mongoose');
var BugUpdate = mongoose.model('BugUpdate');

const calculateHighscore = function (timeper, callback) {
	const testData = [
		{ username: 'tomsoderlund', points: 123 },
		{ username: 'henricM', points: 123 },
		{ username: 'tomsoderlund', points: 123 },
		{ username: 'henricM', points: 123 },
		{ username: 'tomsoderlund', points: 123 },
		{ username: 'henricM', points: 123 },
	];
	callback(null, timeper, testData);
};

module.exports = {

	index: function (req, res, next) {

		const timeperiod = {
			grouping: req.params.grouping || 'weekly',
			startDate: req.params.startDate || '2017-01-01',
			endDate: req.params.endDate || '2018-01-01',
		};

		const renderHighscore = function (err, timeper, results) {
			res.render(
				'updates/highscore',
				{
					title: 'Highscore',
					currentHref: req.path,
					timeperiod: timeper,
					scoreList: results,
				}
			);
		};

		calculateHighscore(timeperiod, renderHighscore);
	}

}