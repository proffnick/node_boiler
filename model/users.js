// require web token
const jwt = require('jsonwebtoken');
// require configuration
const config = require('config'); 
// require joi for validation
const Joi = require('joi');
const mongoose = require('mongoose');
// create a schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 150,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    date: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    }

});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
    return token;
}
// create model for customer
const User = mongoose.model('Users', userSchema);

// validate genre 
function validateUser(user){
    const schema = {
        name: Joi.string().max(50).required().min(5),
        email: Joi.string().required().min(5).max(150).email(),
        password:  Joi.string().required().min(5).max(255)
    }
    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
exports.userSchema = userSchema;

