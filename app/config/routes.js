/**
 * Application routes for REST
 */

'use strict';

var express = require('express');

module.exports = function (app, config) {

	var router = express.Router();
	app.use('/', router);

	// Controllers
	var apiBugUpdatesController = require(config.root + '/app/controllers/api/bugUpdates');
	var webStartController = require(config.root + '/app/controllers/web/start');
	var webBugUpdatesController = require(config.root + '/app/controllers/web/bugUpdates');

	router.get('/', webStartController.index);

	router.get('/api/updates', apiBugUpdatesController.list);
	router.post('/api/updates', apiBugUpdatesController.create);
	router.put('/api/updates/:id', apiBugUpdatesController.update);
	router.delete('/api/updates/:id', apiBugUpdatesController.delete);

	router.post('/api/github-issues', apiBugUpdatesController.createGithubIssue);

	router.get('/updates', webBugUpdatesController.index);

};