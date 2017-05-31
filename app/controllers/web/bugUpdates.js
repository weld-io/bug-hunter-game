'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const async = require('async');

const BugUpdate = mongoose.model('BugUpdate');

module.exports = {

	list: function (req, res, next) {
		var searchQuery = {};
		if (req.params.username) {
			searchQuery.username = req.params.username;
		}
		if (req.params.startDate) {
			searchQuery['created_at'] = searchQuery['created_at'] || {};
			searchQuery['created_at']['$gte'] = new Date(req.params.startDate);
		}
		if (req.params.endDate) {
			searchQuery['created_at'] = searchQuery['created_at'] || {};
			searchQuery['created_at']['$lt'] = new Date(req.params.endDate);
		}
		const sorting = { 'created_at': -1 };
		// Execute query
		BugUpdate.find(searchQuery).sort(sorting).limit(200).populate('bug').exec(function (err, bugUpdates) {
			if (err)
				return next(err);
			res.render('updates/list', {
				title: 'Bug updates',
				bugUpdates: bugUpdates
			});
		});
	}

}