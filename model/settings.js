const Joi = require('joi');
const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
        meansOfIdentity: {
            type: Array,
            default: []
        },
        pricing: {
            type: Array,
            default: []
        },
        date: {
            type: Date,
            default: Date.now
        }
},  {timestamps: {lastUpdated: "lastUpdated"}});

const Settings = mongoose.model('Settings', SettingSchema);

function validateSettings(body, unknown = false){
    const schema = Joi.object({
        meansOfIdentity: Joi.array().min(1)
    });
    return schema.validate(body, {allowUnknown: unknown});
}

exports.Settings        = Settings;
exports.validate         = validateSettings;
exports.SettingSchema   = SettingSchema;