const config    = require('config');
const logger    = require('../middleware/winston');

module.exports = function(){

    if(!config.get('jwtPrivateKey')){
        logger.error('FATAR ERROR: jwtPrivateKey is not defined');
    }
}