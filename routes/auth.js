// import joi
const Joi = require('joi');
// load bcrypt
const bcrypt = require('bcrypt');
// load lodash
const _ = require('lodash');
// require model
const { User } = require('../model/users');

// require express
const express = require('express');

const router = express.Router();

// adding a new genre
router.post('/', async (req, res) => {

    const {error} = validate(req.body);
    
        if(error) res.status(404).send(error.details[0].message);
    
        // look up the user
        let user = await User.findOne({email: req.body.email});
    
        if(!user) res.status(400).send('Invalid email or password');
    
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) res.status(400).send('Invalid email or password');

        const token = user.generateAuthToken();
        res.send(token);
        
    });

    // validate genre 
function validate(user){
    const schema = {
        email: Joi.string().required().min(4).max(150).email(),
        password:  Joi.string().required().min(4).max(255)
    }
    return Joi.validate(user, schema);
}

module.exports = router;