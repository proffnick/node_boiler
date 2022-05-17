require('express-async-errors');
const logger = require('../middleware/winston');
module.exports = function(){
    process.on('uncaughtException', (ex) => {
        logger.error(ex.message, ex);
    });

    // unhandles rejections
    process.on('unhandledRejection', (ex) => {
        logger.error(ex.message, ex);
    });
}