'use strict';

module.exports = {

	index: function (req, res, next) {
		res.render('start/index', { title: 'Bug Hunter Game' });
	}

}