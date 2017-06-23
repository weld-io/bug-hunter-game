'use strict';

const bodyParser = require('body-parser');
const compress = require('compression');
//const cookieParser = require('cookie-parser');
//const cors = require('cors');
const express = require('express');
//const favicon = require('serve-favicon');
const glob = require('glob');
const logger = require('morgan');
//const methodOverride = require('method-override');

module.exports = function (app, config) {
	app.set('views', config.root + '/app/views');
	app.set('view engine', 'ejs');

	//app.use(favicon(config.root + '/public/img/favicon.ico'));
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	//app.use(cookieParser());
	app.use(compress());
	app.use(express.static(config.root + '/public'));
	// flexsite NPM
	app.use('/flexsite', express.static(config.root + '/node_modules/flexsite'));
	//app.use(methodOverride());
	//app.use(cors());

	// Routing
	require('./routes')(app, config);

	app.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	if (app.get('env') === 'development') {
		app.use(function (err, req, res, next) {
			res.status(err.status || 500);
			res.render('shared/error', {
				message: err.message,
				error: err,
				title: 'error'
			});
		});
	}

	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {},
			title: 'error'
		});
	});

};