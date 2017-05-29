'use strict';

module.exports = {

	index: function (req, res, next) {
		res.render('index', { title: 'Bug Hunter Game' });
	}

}