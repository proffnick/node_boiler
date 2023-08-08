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
const cors = require('cors');
const router = express.Router();
router.all('*', cors());

// processing login
router.post('/', async (req, res) => {
    try {
        const allowed = (req?.body?.rtype) ? true: false;
        const {error} = validate(req.body, allowed);
        // if allowed to check rtype and no admin ID provided return

        if(error) return res.status(404).send({error: true, message: error.details[0].message});

        // look up the user
        let user = await User.findOne({phoneNumber: req.body.phoneNumber});

        if(!user) return res.status(400).send({error: true, message: 'Invalid Phone Number or Password'});

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) return  res.status(400).send({error: true, message: 'Invalid Phone Number or Password'});

        // return user details except password
        const token = user.generateAuthToken();
        res.send({success: true, token, user: {...user, password: ''}}); 
    } catch (error) {
        return res.status(500).send({error: true, message: (error?.message)});
    }  
});

router.post('/bio', async (req, res) => {
        
            if(!(req?.body?.phoneNumber)) return res.status(404).send({error: true, message: "Invalid attempt"});
        
            // look up the user
            let user = await User.findOne({phoneNumber: req.body.phoneNumber}).select({
                firstName: 1, 
                lastName: 1, 
                phoneNumber: 1, 
                email: 1, 
                officeAddress: 1, 
                addressCoords: 1, 
                currentLocation: 1, 
                profileImage: 1, 
                date: 1, 
                userType: 1, 
                numberOfRides: 1, 
                averageRequests: 1, 
                meansOfIdentity: 1, 
                identity: 1, 
                approved: 1, 
                region: 1,  
                country: 1, 
                isAdmin: 1, 
                pushNotificationToken: 1,
                hasPendingRequest: 1, 
                isComplete: 1,
                isBiometric: 1
            }).sort({date: 1});
        
            if(!user) return res.status(400).send({error: true, message: 'Invalid Phone Number or Password'});

            if(!user.isBiometric) return res.status(400).send({error: true, message: 'Biometric not set'});

            const token = user.generateAuthToken();
            res.send({success: true, token});
            
});

    // validate genre 
function validate(user, allow=false){
    const schema = Joi.object({
        phoneNumber: Joi.string().required().min(10).max(13),
        password:  Joi.string().required().min(4).max(255)
    });
    return schema.validate(user, {allowUnknown: allow});
}

module.exports = router;