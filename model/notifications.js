const Joi = require('joi');
const mongoose = require('mongoose');

const NotificationsSchema = new mongoose.Schema({
    /*
        CREDIT
        DEBIT
        GENERAL
        UPDATE
        ORDER
    */
    _type: {
        type: String,
        required: true,
        maxlength: 20
    },
    _amount: {
        default: 0,
        type: mongoose.Schema.Types.Decimal128
    },
    _note: {
        type: String,
        required: true
    },
    _action: {
        type: String,
        default: ''
    },
    _read: {
        type: Boolean,
        default: false
    },
    _userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _date: {
        type: Date,
        default: Date.now
    }

},  {timestamps: {lastUpdated: "lastUpdated"}});

const Notifications = mongoose.model('notifications', NotificationsSchema);

const decimal2JSON = (v, i, prev) => {
    if (v !== null && typeof v === 'object') {
      if (v.constructor.name === 'Decimal128')
        prev[i] = parseFloat(v.toString());
      else
        Object.entries(v).forEach(([key, value]) => decimal2JSON(value, key, prev ? prev[i] : v));
    }
  };

  NotificationsSchema.set('toJSON', {
    transform: (doc, ret) => {
      decimal2JSON(ret);
      return ret;
    }
  });

function validateNotifications(body, unknown = false){
    const schema = Joi.object({
        _type: Joi.string().required().max(50).min(2),
        _note: Joi.string().required().max(500).min(2),
        _userid: Joi.objectId().required()
    });
    return schema.validate(body, {allowUnknown: unknown});
}

exports.Notifications   = Notifications;
exports.validate        = validateNotifications;
exports.nameSchema      = NotificationsSchema;