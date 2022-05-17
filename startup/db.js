const { connect } = require('mongoose');
const logger = require('../middleware/winston');
const config = require('config');

module.exports = function(){

    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    connect(config.get('db'), options)
            .then(() => logger.info('Db connected succesfully'));
}