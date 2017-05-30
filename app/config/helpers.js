'use strict';

module.exports = function (app, config) {

	// To string. Months are zero-based
	app.locals.formatDate = function (dateObj) {
		return (dateObj.getFullYear() 
			+ "-" + ('0' + (dateObj.getMonth()+1)).slice(-2) 
			+ "-" + ('0' + dateObj.getDate()).slice(-2)
			+ " " + dateObj.getHours()
			+ ":" + dateObj.getMinutes()
			+ ":" + dateObj.getSeconds()
		);
	};

	app.locals.optionalAnchorTag = function (text, href, currentHref) {
		if (href !== currentHref)
			return '<a href="' + href + '">' + text + '</a>';
		else
			return '<span class="current">' + text + '</span>';
	};


};