const Joi = require('joi');
const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    balance: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        default: 0,
        minlength: 0,
        maxlength: 12
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    wallet_id: {
        type: String,
        required: true,
        unique: true,
        maxlength: 13
    },
    wallet_account_number: {
      type: Number,
      required: false,
      default: null
    },
    wallet_bank_name: {
      type: String,
      required: false,
      default: ''
    },
    ref: {
      type: String,
      unique: true,
      required: true,
    },
    wallet_bank_code: {
      type: String,
      required: false,
      default: '',
      maxlength: 3
    }

},  {timestamps: {lastUpdated: "lastUpdated"}});

const Wallets = mongoose.model('wallets', WalletSchema);

const decimal2JSON = (v, i, prev) => {
    if (v !== null && typeof v === 'object') {
      if (v.constructor.name === 'Decimal128')
        prev[i] = parseFloat(v.toString());
      else
        Object.entries(v).forEach(([key, value]) => decimal2JSON(value, key, prev ? prev[i] : v));
    }
  };
  
WalletSchema.set('toJSON', {
    transform: (doc, ret) => {
      decimal2JSON(ret);
      return ret;
    }
  });

function validateWallets(body){
    const schema = Joi.object({
        balance:    Joi.number().required().min(0),
        user_id:    Joi.objectId().required(),
        wallet_id:  Joi.string().required().max(13).min(9),
        ref:  Joi.string().required().max(255)
    });
    return schema.validate(body);
}

exports.Wallets       = Wallets;
exports.validate      = validateWallets;
exports.nameSchema    = WalletSchema;