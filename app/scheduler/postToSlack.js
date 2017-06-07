#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var request = require('request');

var app = require('../app');
var webHighscoreController = require('../controllers/web/highscore');


const DEBUG_NO_SLACK = false;


const run = function () {

	const timeperiod = {
		grouping: 'weekly',
		startDate: webHighscoreController.getCurrentWeekDate(),
		endDate: webHighscoreController.getCurrentWeekDate(+1),
	};

	const postMessageToSlack = function (msg, cb) {
		var payload = { text: msg };
		var url = process.env.SLACK_WEBHOOK_URL;
		if (DEBUG_NO_SLACK)
			cb();
		else
			request({ method: 'POST', url: url, json: payload }, cb);
	};

	const formatResults = function (timeper, results, cb) {
		if (results.length === 0) {
			cb('Nothing to post.');
		}
		else {
			const userSummary = _.reduce(results, function (oldStr, res) {
				if (oldStr === '')
					return oldStr + `*${res.username}* is in the lead with ${res.points} points`;
				else
					return oldStr + `, then *${res.username}* (${res.points} points)`;
			}, '');
			const message = 'This week’s bug hunting: ' + userSummary + '.\n'
				+ process.env.HOSTNAME + '/highscore/weekly';
			console.log('Slack message:', message);
			cb(null, message);
		}
	};

	const whenWaterfallDone = function (err, result) {
		console.log('postMessageToSlack done (debug=%s):', DEBUG_NO_SLACK, err);
		app.closeDatabase();
	}

	async.waterfall([
			webHighscoreController.calculateHighscore.bind(this, timeperiod),
			formatResults,
			postMessageToSlack,
		],
		whenWaterfallDone
	);

}

console.log('Bug Hunter Game: post to Slack');

run();
