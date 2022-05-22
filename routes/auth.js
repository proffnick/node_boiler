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
    
        if(error) return res.status(404).send({error: true, message: error.details[0].message});
    
        // look up the user
        let user = await User.findOne({email: req.body.email});
    
        if(!user) return res.status(400).send({error: true, message: 'Invalid email or password'});
    
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) return  res.status(400).send({error: true, message: 'Invalid email or password'});

        const token = user.generateAuthToken();
        res.send({success: true, token});
        
    });

    // validate genre 
function validate(user){
    const schema = Joi.object({
        email: Joi.string().required().min(4).max(150).email(),
        password:  Joi.string().required().min(4).max(255)
    });
    return schema.validate(user);
}

module.exports = router;