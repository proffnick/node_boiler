const Joi = require('joi');
const mongoose = require('mongoose');

const NameSchema = new mongoose.Schema({

},  {timestamps: {lastUpdated: "lastUpdated"}});

const Names = mongoose.model('names', NameSchema);

function validateNames(body){
    const schema = Joi.object({
        title: Joi.string().required().max(50).min(2),
        desc: Joi.string().required().max(500).min(1)
    });
    return schema.validate(body);
}

exports.Names        = Names;
exports.validate         = validateNames;
exports.nameSchema   = NameSchema;