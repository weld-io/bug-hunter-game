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


## REST API

### DataRows

List bug updates

	curl http://localhost:3033/api/updates

Get a specific bug update

	curl http://localhost:3033/api/updates/[ROW_ID]

Create new bug update (**used by GitHub Webhook**):

	curl -X POST -H "Content-Type: application/json" -d '{}' http://localhost:3033/api/updates

Update bug update:

	curl -X PUT -H "Content-Type: application/json" -d '{}' http://localhost:3033/api/updates/[ROW_ID]

Delete bug update:

	curl -X DELETE http://localhost:3033/api/updates/[ROW_ID]

Delete all bug updates:

	curl -X DELETE http://localhost:3033/api/updates/ALL
