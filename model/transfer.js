const Joi = require('joi');
const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
    recipient_code: {
        type: String,
        required: true
    },
    transfer_code: {
        type: String,
        default: ''
    },
    reference: {
        type: String,
        default: ''
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
},  {timestamps: {lastUpdated: "lastUpdated"}});

const Transfers = mongoose.model('transfers', TransferSchema);

const decimal2JSON = (v, i, prev) => {
    if (v !== null && typeof v === 'object') {
      if (v.constructor.name === 'Decimal128')
        prev[i] = parseFloat(v.toString());
      else
        Object.entries(v).forEach(([key, value]) => decimal2JSON(value, key, prev ? prev[i] : v));
    }
  };

  TransferSchema.set('toJSON', {
    transform: (doc, ret) => {
      decimal2JSON(ret);
      return ret;
    }
  });

function validateTransfers(body, unknown = false){
    const schema = Joi.object({
        recipient_code: Joi.string().required().max(50).min(2),
        amount: Joi.number().required(),
        user_id: Joi.objectId().required()
    });
    return schema.validate(body, {allowUnknown: unknown});
}

exports.Transfers        = Transfers;
exports.validate         = validateTransfers;
exports.transferSchema   = TransferSchema;