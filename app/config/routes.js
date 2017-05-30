/**
 * Application routes for REST
 */

'use strict';

var express = require('express');

module.exports = function (app, config) {

	var router = express.Router();
	app.use('/', router);

	// API
	var apiBugUpdatesController = require(config.root + '/app/controllers/api/bugUpdates');

	router.get('/api/updates', apiBugUpdatesController.list);
	router.post('/api/updates', apiBugUpdatesController.create);
	router.put('/api/updates/:id', apiBugUpdatesController.update);
	router.delete('/api/updates/:id', apiBugUpdatesController.delete);
	router.put('/api/updates/recalculate', apiBugUpdatesController.recalculate);

	router.post('/api/github-issues', apiBugUpdatesController.createGithubIssue);

	// Web
	var webStartController = require(config.root + '/app/controllers/web/start');
	var webBugUpdatesController = require(config.root + '/app/controllers/web/bugUpdates');
	var webHighscoreController = require(config.root + '/app/controllers/web/highscore');

	router.get('/updates/:username/:startDate/:endDate', webBugUpdatesController.list);
	router.get('/updates', webBugUpdatesController.list);
	router.get('/highscore/:grouping/:startDate/:endDate', webHighscoreController.index);
	router.get('/highscore/:grouping', webHighscoreController.index);
	router.get('/highscore', webHighscoreController.index);
	router.get('/', webStartController.index);

};