#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var request = require('request');

var app = require('../app');
var webHighscoreController = require('../controllers/web/highscore');


const run = function () {

	const timeperiod = {
		grouping: 'weekly',
		startDate: webHighscoreController.getWeekDate(),
		endDate: webHighscoreController.getWeekDate(+1),
	};

	const postMessageToSlack = function (msg, cb) {
		var payload = { text: msg };
		var url = process.env.SLACK_WEBHOOK_URL;
		request({ method: 'PUT', url: url, json: payload }, cb);
	};

	const formatResults = function (timeper, results, cb) {
		const userSummary = _.reduce(results, function (oldStr, res) {
			if (oldStr === '')
				return oldStr + `*${res.username}* is in the lead with ${res.points} points`;
			else
				return oldStr + `, then *${res.username}* (${res.points} points)`;
		}, '');
		const message = 'This week’s bug hunting: ' + userSummary + '.\n'
			+ process.env.HOSTNAME + '/highscore/weekly';
		console.log(message);
		cb(null, message);
	};

	const whenWaterfallDone = function (err, result) {
		// err truthy if err in any function
		// result now equals 'done'
		console.log('whenWaterfallDone', err, result);
	}

	async.waterfall([
			webHighscoreController.calculateHighscore.bind(this, timeperiod),
			formatResults,
			postMessageToSlack,
			app.closeDatabase,
		],
		whenWaterfallDone
	);

}

console.log('Bug Hunter Game: post to Slack');

run();
