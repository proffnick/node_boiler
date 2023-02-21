const Joi = require('joi');
const mongoose = require('mongoose');

const constantSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 50,
        minlength: 2,
        uppercase: true,
        unique: true
    },
    desc: {
        type: String,
        required: true,
        maxlength: 500,
    },
    lastUpdated: {
        type: Date,
        default: new Date()
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {timestamps: {lastUpdated: "lastUpdated"}});


const Constants = mongoose.model('constants', constantSchema);

function validateConstants(consts){
    const schema = Joi.object({
        title: Joi.string().required().max(50).min(2),
        desc: Joi.string().required().max(500).min(1)
    });
    return schema.validate(consts);
}

exports.Constants        = Constants;
exports.validate         = validateConstants;
exports.constantSchema   = constantSchema;