# Bug Hunter Game

Bug Hunter Game is an web service that turns GitHub Issues into a game.


## How to Run

Just start with:

	npm start

or

	npm run-script dev

Server will default to **http://localhost:3033**


## How to Test

	npm test


## Entities

* Bug: similar to GitHub issue.
* Bug Update: a _change_ e.g. bug opened/closed.


## REST API

### Bugs

### Bug Updates

List bug updates

	curl http://localhost:3033/api/updates

Get a specific bug update

	curl http://localhost:3033/api/updates/[ROW_ID]

Create new bug update:

	curl -X POST -H "Content-Type: application/json" -d '{}' http://localhost:3033/api/updates

Update bug update:

	curl -X PUT -H "Content-Type: application/json" -d '{}' http://localhost:3033/api/updates/[ROW_ID]

Delete bug update:

	curl -X DELETE http://localhost:3033/api/updates/[ROW_ID]

Delete all bug updates:

	curl -X DELETE http://localhost:3033/api/updates/ALL

### GitHub webhook

Adapted from [GitHub’s example](https://developer.github.com/v3/activity/events/types/#issuesevent).

	curl -X POST http://localhost:3033/api/github-issues -H "Content-Type: application/json" -d \
	'{
		"action": "opened",
		"sender": {
			"login": "baxterthehacker",
			"id": 6752317
		},
		"issue": {
			"url": "https://api.github.com/repos/baxterthehacker/public-repo/issues/2",
			"id": 73464126,
			"number": 2,
			"title": "Spelling error in the README file",
			"body": "It looks like you accidently spelled commit with two ts.",
			"user": {
				"login": "baxterthehacker",
				"id": 6752317
			},
			"state": "open",
			"locked": false,
			"assignee": null,
			"milestone": null,
			"comments": 0,
			"created_at": "2015-05-05T23:40:28Z",
			"updated_at": "2015-05-05T23:40:28Z",
			"closed_at": null,
			"labels": [
				{
					"id": 208045946,
					"name": "bug",
					"color": "fc2929",
					"default": true
				}
			]
		},
		"repository": {
			"id": 35129377,
			"name": "public-repo"
		}
	}'


## Deploying on Heroku

	# Set up and configure app
	heroku create MYAPPNAME
	heroku config:set NODE_ENV=production
	heroku addons:create mongolab
	git push heroku master
