const config = require('./config/config');
const app = require('./app');

const portNumber = process.env.PORT || config.port;
console.log('bug-hunter-game running on http://localhost:' + portNumber);
app.listen(portNumber);