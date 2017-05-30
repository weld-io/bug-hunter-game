'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const async = require('async');
const moment = require('moment');

const BugUpdate = mongoose.model('BugUpdate');

const getWeekDate = function (incr) {
	const monday = moment().startOf('isoweek').add((incr || 0), 'weeks');
	return monday.format('YYYY-MM-DD');
};

const getYearDate = function (incr) {
	const year = (new Date()).getYear() + 1900 + (incr || 0);
	return year + '-01-01';
};

const getTimeValue = function (dateObj, grouping) {
	const momDate = moment(dateObj);
	switch (grouping) {
		case 'weekly':
			return 'w' + momDate.format('W');
		case 'monthly':
			return momDate.format('MMM');
		case 'yearly':
			return momDate.format('YYYY');
		default:
			return null;
	}
};

const calculateHighscore = function (timeper, callback) {

	var searchQuery = {};
	if (_.has(timeper, 'startDate')) {
		searchQuery['created_at'] = { "$gte": new Date(timeper.startDate), "$lt": new Date(timeper.endDate) };
	}

	BugUpdate.find(searchQuery, null, { sort: { dateCreated: -1 } }, function (err, updates) {
		// { timevalue: '22', username: 'baxterthehacker', points: 10 },
		const updatesMod = _.map(updates, function (upd) {
			return {
				timevalue: getTimeValue(upd.created_at, timeper.grouping),
				username: upd.username,
				points: upd.points,
			};
		});
		// '22-baxterthehacker': { timevalue: '22', username: 'baxterthehacker', points: 10 },
		const updatesSummary = _.reduce(updatesMod, function (summ, upd) {
			const keyName = upd.timevalue + '-' + upd.username;
			const defaultValues = {
				timevalue: upd.timevalue,
				username: upd.username,
				points: 0,
			};
			summ[keyName] = summ[keyName] || defaultValues;
			summ[keyName].points += upd.points;
			return summ;
		}, {});
		const sortedSummary = _.orderBy(updatesSummary, ['timevalue', 'points'], ['asc', 'desc']);
		callback(null, timeper, sortedSummary);
	});
};

module.exports = {

	getWeekDate: getWeekDate,
	getYearDate: getYearDate,
	calculateHighscore: calculateHighscore,


	index: function (req, res, next) {

		const timeperiod = {
			grouping: req.params.grouping || 'weekly',
			startDate: req.params.startDate || getYearDate(),
			endDate: req.params.endDate || getYearDate(+1),
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
	},

}