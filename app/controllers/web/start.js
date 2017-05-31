'use strict';

const scoringTable = require('../../config/scoring');

module.exports = {

	index: function (req, res, next) {
		res.render(
			'start/index',
			{
				title: 'Bug Hunter Game',
				githubUrl: 'https://github.com/' + process.env.GITHUB_PROJECT_ID + '/issues',
				scoringTable: scoringTable,
			}
		);
	}

}