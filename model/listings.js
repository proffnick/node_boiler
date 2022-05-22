
// require joi for validation
const Joi = require('joi');
const mongoose = require('mongoose');
// create a schema
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
        trim: true
    },
    images: {
        type: [new mongoose.Schema({url:{type: String}, thumbnailUrl: {type: String}})],
        required: true,
    },
    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        minlength: 0,
        maxlength: 8
    },
    categoryId: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    location:{
        type: Object,
        default: {}
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }

});

const decimal2JSON = (v, i, prev) => {
    if (v !== null && typeof v === 'object') {
      if (v.constructor.name === 'Decimal128')
        prev[i] = parseFloat(v.toString());
      else
        Object.entries(v).forEach(([key, value]) => decimal2JSON(value, key, prev ? prev[i] : v));
    }
  };
  
  listingSchema.set('toJSON', {
    transform: (doc, ret) => {
      decimal2JSON(ret);
      return ret;
    }
  });

// create model for customer
const Listing = mongoose.model('Listings', listingSchema);

// validate genre 
function validateListing(listing){
    const schema = Joi.object({
        title:  Joi.string().max(150).required().min(5),
        images: Joi.array().items(Joi.object({url: Joi.string(), thumbnailUrl: Joi.string()})).min(1).max(5),
        price:  Joi.number().precision(2).required().min(0),
        categoryId: Joi.string(),
        userId: Joi.objectId().required(),
        location: Joi.string().max(200),
        description: Joi.string().max(500)

    })
    return schema.validate(listing);
}

exports.Listing         = Listing;
exports.validate        = validateListing;
exports.listingSchema   = listingSchema;

