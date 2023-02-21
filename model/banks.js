const Joi = require('joi');
const mongoose = require('mongoose');
/*
Structure Of Body
        "type":"nuban",
        "name" : "John Doe",
        "account_number": "0001234567",
        "bank_code": "058",
        "currency": "NGN"
*/
const BankSchema = new mongoose.Schema({
    account_type: {
        type: String,
        default: 'nuban',
    },
    account_name: {
        type: String,
        required: true,
        maxlength: 255,
    },
    account_number: {
        type: String,
        required: true,
        maxlength: 10
    },
    bank_code: {
        type: String,
        required: true,
        maxlength: 10
    },
    account_currency: {
        type: String,
        default: 'NGN'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    }
},  {timestamps: {lastUpdated: "lastUpdated"}});

const Banks = mongoose.model('banks', BankSchema);

function validateBanks(body){
    const schema = Joi.object({
        account_name: Joi.string().required().max(255).min(2),
        account_number: Joi.number().required().max(10).min(10),
        bank_code: Joi.number().required().max(4).min(3),
        user_id: Joi.objectId().required(),
    });
    return schema.validate(body);
}

exports.Banks        = Banks;
exports.validate         = validateBanks;
exports.nameSchema   = BankSchema;