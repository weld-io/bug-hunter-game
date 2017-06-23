'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const async = require('async');
const moment = require('moment');

const BugUpdate = mongoose.model('BugUpdate');

const getCurrentWeekDate = function (incr) {
	const monday = moment().startOf('isoweek').add((incr || 0), 'weeks');
	return monday.format('YYYY-MM-DD');
};

const getCurrentYearDate = function (incr) {
	const year = (new Date()).getYear() + 1900 + (incr || 0);
	return year + '-01-01';
};

const getTimeValues = function (dateObj, grouping) {
	const momDate = moment(dateObj);
	const values = {};
	switch (grouping) {
		case 'daily':
			values.timevalue = momDate.format('YYYY-MM-DD');
			values.timevalueToDisplay = momDate.format('MMM D (ddd)');
			values.periodStartDate = momDate.clone().format('YYYY-MM-DD');
			values.periodEndDate = momDate.clone().add(1, 'days').format('YYYY-MM-DD');
			break;
		case 'weekly':
			values.timevalue = momDate.format('YYYY') + '-w' + momDate.format('W');
			values.timevalueToDisplay = 'w' + momDate.format('W');
			values.periodStartDate = momDate.clone().startOf('isoweek').format('YYYY-MM-DD');
			values.periodEndDate = momDate.clone().startOf('isoweek').add(1, 'weeks').format('YYYY-MM-DD');
			break;
		case 'monthly':
			values.timevalue = momDate.format('YYYY-MM');
			values.timevalueToDisplay = momDate.format('MMM');
			values.periodStartDate = momDate.clone().date(1).format('YYYY-MM-DD');
			values.periodEndDate = momDate.clone().date(1).add(1, 'months').format('YYYY-MM-DD');
			break;
		case 'yearly':
			values.timevalue = momDate.format('YYYY');
			values.timevalueToDisplay = momDate.format('YYYY');
			values.periodStartDate = momDate.clone().month(0).date(1).format('YYYY-MM-DD');
			values.periodEndDate = momDate.clone().month(0).date(1).add(1, 'years').format('YYYY-MM-DD');
			break;
	}
	return values;
};

const calculateHighscore = function (timeper, callback) {

	var searchQuery = {};
	if (_.has(timeper, 'startDate')) {
		searchQuery['created_at'] = { "$gte": new Date(timeper.startDate), "$lt": new Date(timeper.endDate) };
	}

	BugUpdate.find(searchQuery, null, { sort: { dateCreated: -1 } }, function (err, updates) {
		// { timevalue: '22', username: 'baxterthehacker', points: 10 },
		const updatesMod = _.map(updates, function (upd) {
			const values = {
				username: upd.username,
				points: upd.points,
			};
			_.merge(values, getTimeValues(upd.created_at, timeper.grouping));
			return values;
		});
		// '22-baxterthehacker': { timevalue: '22', username: 'baxterthehacker', points: 10 },
		const updatesSummary = _.reduce(updatesMod, function (summ, upd) {
			const keyName = upd.timevalue + '-' + upd.username;
			const defaultValues = _.merge({}, upd, { points: 0 });
			summ[keyName] = summ[keyName] || defaultValues;
			summ[keyName].points += upd.points;
			return summ;
		}, {});
		const sortedSummary = _.orderBy(updatesSummary, ['timevalue', 'points'], ['asc', 'desc']);
		callback(null, timeper, sortedSummary);
	});
};

module.exports = {

	getCurrentWeekDate: getCurrentWeekDate,
	getCurrentYearDate: getCurrentYearDate,
	calculateHighscore: calculateHighscore,

	index: function (req, res, next) {

		const timeperiod = {
			grouping: req.params.grouping || 'weekly',
			startDate: req.params.startDate || getCurrentYearDate(),
			endDate: req.params.endDate || getCurrentYearDate(+1),
		};

		const renderHighscore = function (err, timeper, results) {
			console.log('timeper', timeper);
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