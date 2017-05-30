'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const async = require('async');

const BugUpdate = mongoose.model('BugUpdate');

module.exports = {

	index: function (req, res, next) {
		BugUpdate.find().sort({ dateCreated: -1 }).exec(function (err, updates) {
			if (err)
				return next(err);
			res.render('updates/index', {
				title: 'All bug updates',
				updates: updates
			});
		});
	}

}