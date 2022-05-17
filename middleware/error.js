const logger = require('./winston'); 

module.exports = function(error, req, res, next){
    // log errors
    logger.error(error.message, error);

    res.status(500).send('Something failed on the server, please try again');
}