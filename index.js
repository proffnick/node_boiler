const express   = require('express');
const app       = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);


const port = process.env.PORT || 4000;
app.listen(port, () =>{
    console.log(`App Listening at port ${port}`);
});