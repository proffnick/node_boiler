const Joi           = require('joi');
const mongoose      = require('mongoose');

const OrdersSchema = new mongoose.Schema({

    item: {
        type: String,
        required: true,
        maxlength: 255
    },
    itemDesc: {
        type: String,
        maxlength: 250,
        default: ''
    },
    quantity: {
        type: Number,
        required: true
    },
    weight: {
        type: String,
        default: '1kg',
        maxlength: 255
    },
    pickup: {
        type: Object,
        required: true
    },
    deliver: {
        type: Object,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: null
    },
    cost: {
        type: mongoose.Schema.Types.Decimal128
    },
    status: {
        type: Boolean,
        default: false 
    },
    state: {
        type: String,
        default: 'requested' // requested, pending, intransit, delivered, deleted
    },
    riderEnded: {
        type: Boolean,
        default: false
    },
    customerConfirmed: {
        type: Boolean,
        default: false 
    },
    date: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    } 

},  {timestamps: {lastUpdated: "lastUpdated"}});

const Orders = mongoose.model('orders', OrdersSchema);

const decimal2JSON = (v, i, prev) => {
    if (v !== null && typeof v === 'object') {
      if (v.constructor.name === 'Decimal128')
        prev[i] = parseFloat(v.toString());
      else
        Object.entries(v).forEach(([key, value]) => decimal2JSON(value, key, prev ? prev[i] : v));
    }
  };

  OrdersSchema.set('toJSON', {
    transform: (doc, ret) => {
      decimal2JSON(ret);
      return ret;
    }
  });

function validateOrders(body, unknown = false){
    const schema = Joi.object({
        item: Joi.string().required().max(255).min(2), 
        itemDesc: Joi.string().max(250).allow(null, ''),
        quantity:   Joi.number().required().min(1),
        distance:   Joi.number().required().min(0),  
        weight: Joi.string().required().max(255), 
        pickup: Joi.object().required(), 
        deliver: Joi.object().required(), 
        customer: Joi.objectId().required(),
        cost:Joi.number().required().min(1)
    });
    return schema.validate(body, {allowUnknown: unknown});
}

exports.Orders       = Orders;
exports.validate     = validateOrders;
exports.nameSchema   = OrdersSchema;