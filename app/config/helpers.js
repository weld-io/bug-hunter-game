'use strict';

const moment = require('moment');

module.exports = function (app, config) {

	// To string. Months are zero-based
	app.locals.formatDate = function (dateObj) {
		return moment(dateObj).format("YYYY-MM-DD HH:mm"); ;
	};

	app.locals.optionalAnchorTag = function (text, href, currentHref) {
		if (href !== currentHref)
			return '<a href="' + href + '">' + text + '</a>';
		else
			return '<span class="current">' + text + '</span>';
	};


};