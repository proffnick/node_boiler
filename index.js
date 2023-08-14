const express   = require('express');
const app       = express();
const https = require('https');
const fs = require('fs');

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/app.psalogistics.ng/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/app.psalogistics.ng/fullchain.pem'),
};

const server = https.createServer(options, app);

const port = process.env.PORT || 5555;
server.listen(port, () =>{
    console.log(`App Listening at port ${port}`);
});