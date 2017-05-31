'use strict';

const _ = require('lodash');
const moment = require('moment');

module.exports = function (app, config) {

	// To string. Months are zero-based
	app.locals.formatDate = function (dateObj) {
		//return moment(dateObj).format("YYYY-MM-DD HH:mm");
		return moment(dateObj).format("YYYY-MM-DD");
	};

	app.locals.optionalAnchorTag = function (text, href, currentHref) {
		if (href !== currentHref)
			return '<a href="' + href + '">' + text + '</a>';
		else
			return '<span class="current">' + text + '</span>';
	};

	app.locals.objectToHtml = function (obj) {

		const keyToHtml = function (value, keyAsHeader) {
			if (typeof(value) === 'object') {
				return _.reduce(value, function (prevTxt, val, key) {
					return prevTxt
						+ (keyAsHeader ? '<strong>' + key + '</strong><br>' : key + ': ')
						+ keyToHtml(val)
						+ '<br>';
				}, '');
			}
			else {
				return value;
			}
		};

		return keyToHtml(obj, true);
	};

};