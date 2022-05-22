const  multiparty   = require('multiparty');
const logger        = require('../middleware/winston');
module.exports = function(req, res, next){
    
    if(req.method.toUpperCase() === 'POST'){
        const form = new multiparty.Form();
        
        form.parse(req, function(err, fields, files) {
            if(err) return logger.error(JSON.stringify(err));

            req.body = {
                ...fields,
                ...files,
            }
        });
    }
    next();
}