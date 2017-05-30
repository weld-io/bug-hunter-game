const express = require('express');
const config = require('./config/config');
const glob = require('glob');
const mongoose = require('mongoose');

mongoose.connect(config.db);
const db = mongoose.connection;
db.on('error', function () {
	throw new Error('unable to connect to database at ' + config.db);
});

const models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
	require(model);
});
const app = express();

require('./config/express')(app, config);
require('./config/helpers')(app, config);

module.exports = app;
module.exports.closeDatabase = function () {
	mongoose.connection.close();
};
