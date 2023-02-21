// require web token
const jwt = require('jsonwebtoken');
// require configuration
const config = require('config'); 
// require joi for validation
const Joi = require('joi');
const mongoose = require('mongoose');
// create a schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        maxlength: 13
    },
    email: {
        type: String,
        maxlength: 150,
        trim: true,
        unique: false,
        default: ''
    },
    officeAddress: {
        type: String,
        default: ''
    },
    addressCoords: {
        type: Object,
        default: null
    },
    currentLocation: {
        type: Object,
        default: null 
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    profileImage: {
        type: Object,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    },
    userType: {
        type: String,
        default: ""
    },
    numberOfRides: {
        type: Number,
        default: 0
    },
    averageRequests: {
        type: Number,
        default: 0
    },
    meansOfIdentity: {
        type: String,
        default: '',
    },
    identity: {
        type: Object,
        default: {},
    },
    approved: {
        type: Boolean,
        default: false,
    },
    region: {
        type: String,
        default: "Abuja"
    },
    country: {
        type: String,
        default: "Nigeria"
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBiometric: {
        type: Boolean,
        default: false
    },
    pushNotificationToken: {
        type: String,
        default: '',
        maxlength: 1024
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    subRegion: {
        type: String,
        maxlength: 1024
    },
    online: {
        type: Boolean,
        default: false
    },
    hasPendingRequest: {
        type: Boolean,
        default: false
    },
    isComplete: {
        type: Boolean,
        default: false
    }

}, {timestamps: {createdAt: 'createdAt'}});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({
                    _id: this._id, 
                    isAdmin: this.isAdmin, 
                    email: this.email,
                    approved: this.approved,
                    firstName: this.firstName,
                    lastName: this.lastName, 
                    phoneNumber: this.phoneNumber,
                    userType: this.userType, 
                    profileImage: this.profileImage,
                    isComplete: this.isComplete,
                    isBiometric: this.isBiometric,
                    hasPendingRequest: this.hasPendingRequest,
                    pushNotificationToken: this.pushNotificationToken}, config.get('jwtPrivateKey'));
    return token;
}

// create model for customer
const User = mongoose.model('Users', userSchema);

// validate genre 
function validateUser(user, unknown = false, update = false){

    // email: Joi.string().required().min(5).max(150).email()
    const schema = !update ? Joi.object({
        firstName: Joi.string().max(50).required().min(1),
        lastName: Joi.string().max(50).required().min(1),
        phoneNumber: Joi.string().max(13).required(),
        email: Joi.string().allow(null, ''),
        password:  Joi.string().required().min(5).max(255),
        pushNotificationToken: Joi.string()
    }):
    Joi.object({
        firstName: Joi.string().max(50).required().min(1),
        lastName: Joi.string().max(50).required().min(1),
        phoneNumber: Joi.string().max(13).required(),
        email: Joi.string().allow(null, ''),
        password:  Joi.string().required().min(5).max(255),
        pushNotificationToken: Joi.string()
    });
    return schema.validate(user, {allowUnknown: unknown});
}

exports.User = User;
exports.validate = validateUser;
exports.userSchema = userSchema;

