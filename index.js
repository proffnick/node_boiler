const express   = require('express');
const app       = express();
const path      = require('path');

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

// use static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));


const port = process.env.PORT || 4000;
app.listen(port, () =>{
    console.log(`App Listening at port ${port}`);
});