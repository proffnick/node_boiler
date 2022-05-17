const config = require('config');
const mongoose = require('mongoose');
async function getConn(){
    return await mongoose.connect(config.get('db'), {useNewUrlParser: true, useUnifiedTopology: true})
        .then((conn) => {
            return conn;
        }).catch(err => {
            return err;
        });
}
exports.Con = getConn;