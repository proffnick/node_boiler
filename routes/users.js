const auth      = require('../middleware/auth');
// load bcrypt
const bcrypt    = require('bcrypt');
// load lodash
const _         = require('lodash');
const cors      = require('cors');
// require model
const {User, validate} = require('../model/users');

// push notification

// const pushNotification = require('../utilities/pushNotifications');

// require express
const express   = require('express');

const router    = express.Router();
                router.all('*', cors());

// request for all customers
router.get('/', auth, async (req, res) => {
    const user = await User
    .find()
    .limit(50)
    .select({
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
        isComplete: 1,
        isBiometric: 1,
        lastSeen: 1,
        subRegion: 1,
        hasPendingRequest: 1,
        online: 1
        }).sort({date: 1});
    res.send(user);

});

router.get('/active/riders', async (req, res)=>{
    if(!req.query.active) return res.status(404).send({error: true, message: 'Bad Request'});
    const query = JSON.parse(decodeURI(req.query.active));
   // console.log(JSON.stringify(query));
    const users = await User.find(query).select({
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
        isComplete: 1,
        isBiometric: 1,
        lastSeen: 1,
        subRegion: 1,
        online: 1,
        hasPendingRequest: 1
        }).sort({date: 1});
    res.send(users);

});

router.get('/count-all-users', auth, async (req, res) => {
    try {   
        const dt = (req.query?.where) ? JSON.parse(decodeURIComponent(req.query?.where)): {};
       User.countDocuments(dt)
        .then((count) => {
            return res.status(200).send({status: true, total: count});
        })
        .catch((error) => {
           return res.status(500).send({status: false, message: error?.message});
        });

    } catch (error) {
     res.status(500).send({status: false, message: error?.message}); 
    }
});

router.get('/:id', async (req, res)=>{
    // check if genres available
    try {
        const user = await User.findOne({_id: req.params.id}).select({
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
            isComplete: 1,
            isBiometric: 1,
            lastSeen: 1,
            subRegion: 1,
            online: 1,
            hasPendingRequest: 1
            }).sort({date: 1});
        res.send(user);
    } catch (error) {
        res.status(404).send({error: true, message: "request not found"})
    }
    

});

// get single user
router.get('/me', auth, async (req, res)=>{
    // check if genres available
    const user = await User.findById(req.user._id).select('-password');
    res.send(user); 

});

router.post('/find', async (req, res)=>{
    const error = !req.body.hasOwnProperty('phoneNumber') ? true : false;

    if(error) return res.status(400).send({error: true, message: 'Bad Request'});
    // check if users available
    const user = await User.findOne({phoneNumber: req.body.phoneNumber}).select({
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
        isComplete: 1,
        isBiometric:1,
        lastSeen: 1,
        subRegion: 1,
        online: 1,
        hasPendingRequest: 1
        }).sort({date: 1});

    //console.log(user);

    res.send(user);

});

router.post('/fetch-users', auth, async (req, res) => {
    try {
        const query = {};
        const { 
            child, 
            value, 
            startDate,  
            endDate, 
            limit,
            skip
        } = req.body;
        if( child ) query[child] = value;
        if( startDate && endDate ) { 
            const isoDateStart  = new Date(startDate).toISOString();
            const isoDateEnd    = new Date(endDate).toISOString();
            query[`$and`] = [{date: {$gte: isoDateStart}}, {date: {$lte: isoDateEnd}}];
        }

        console.log(query, " the query strings");

        const users = User
        .find(query)
        .limit(limit)
        .skip( !(NaN(skip)) ? skip: 0 )
        .select({
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
            isComplete: 1,
            isBiometric: 1,
            lastSeen: 1,
            subRegion: 1,
            hasPendingRequest: 1,
            online: 1        
        }).sort({date: -1});
        
        // total details
        const total = await User.countDocuments(query);

        console.log(users, total);

        return res.status(200).send({status: true, total: total, data: users});

    } catch (error) {
      return res.status(500).send({status: false, message: error?.message});  
    }
});

// adding a new user
router.post('/', async (req, res) => {

    const {error} = validate(req.body);

    if(error) return res.status(404).send({error: true, message: error.details[0].message});

    // look up the user
    let user = await User.findOne({phoneNumber: req.body.phoneNumber});

    if(user){ return res.status(400).send({error: true, message: 'User already registered!'});}

    user = new  User(_.pick(req.body, ['firstName','lastName', 'phoneNumber', 'password']));

    const salt     = await bcrypt.genSalt(15);
    user.password  = await bcrypt.hash(user.password, salt);

    await user.save();
    console.log("after data saved! 64");
    // before sending response to the client, please generate the token
    //const token = jwt.sign({_id: user._id}, config.get('jwtPrivateKey'));
    const token = user.generateAuthToken();

    // add token into user  and return it
    user['webtoken'] = token;

   res.header('x-auth-token', token).send(_.pick(user, ['_id', 'firstName','lastName', 'phoneNumber', 'webtoken', '_id']));
    
});


router.put('/password/:id', async (req, res) => {

    try {
        const id = req.params.id;

        const foundUser         = User.findOne({_id: id});
        if(!foundUser) return res.status(404).send({error: true, message: "User not found!"});
    
        //console.log(req.body)
        const salt          = await bcrypt.genSalt(15);
        const password      = await bcrypt.hash(req.body.password, salt);
    
        const user = await User.findByIdAndUpdate(id, {
            $set:{password, salt}
          }, {new : true});
    
          if(!user) return res.status(404).send({error: true, message: `user with id ${id} not found!`});
          // test push notofication
          //pushNotification([req.body.pushNotificationToken], "We have a message for you!");
          res.send(user);
    } catch (error) {
        return res.status(500).send({error: true, message: (error?.message)});  
    }
   
});


router.put('/:id', auth, async (req, res) => {

    const id = req.params.id;

    const found = User.findOne({_id: id});
    if(!found) return res.status(404).send({error: true, message: `User with the id ${id}, not found!`});
    //console.log(req.body);
    const user = await User.findByIdAndUpdate(id, {
        $set:{...req.body}
      }, {new : true});

      if(!user) return res.status(404).send({error: true, message: `user with id ${id} not found!`});

      // test push notofication
      //pushNotification([req.body.pushNotificationToken], "We have a message for you!");

      res.send(user);
});

// delete a genre
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const user = await User.findByIdAndRemove(id);
    if(!user) res.status(404).send({error: true, message: `user with id ${id} not found!`});
    res.send(user);
});

// listen at a port
module.exports = router;