'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// https://developer.github.com/v3/activity/events/types/#issuesevent
const BugUpdateSchema = new Schema({
	bug: { type: Schema.Types.ObjectId, ref: 'Bug', required: true },
	created_at: { type: Date, default: Date.now },
	action: String,
	username: String,
	points: { type: Number, default: 0 },
});

mongoose.model('BugUpdate', BugUpdateSchema);
