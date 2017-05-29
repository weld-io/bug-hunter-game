'use strict';

const path = require('path');
const rootPath = path.normalize(__dirname + '/../..');
const env = process.env.NODE_ENV || 'development';

var config = {

	development: {
		root: rootPath,
		app: {
			name: 'bug-hunter-game'
		},
		port: 3033,
		db: 'mongodb://localhost/bug-hunter-game-development'
		
	},

	test: {
		root: rootPath,
		app: {
			name: 'bug-hunter-game'
		},
		port: 3000,
		db: 'mongodb://localhost/bug-hunter-game-test'
		
	},

	production: {
		root: rootPath,
		app: {
			name: 'bug-hunter-game'
		},
		port: 3000,
		db: process.env.MONGOHQ_URL || 'mongodb://localhost/bug-hunter-game-production'

	}

};

module.exports = config[env];
