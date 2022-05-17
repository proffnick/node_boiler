const auth = require('../middleware/auth');
// load bcrypt
const bcrypt = require('bcrypt');
// load lodash
const _ = require('lodash');
// require model
const {User, validate} = require('../model/users');

// require express
const express = require('express');

const router = express.Router();

// request for all customers
router.get('/', async (req, res)=>{
    // check if genres available
    const user = await User.find().select({name: 1, email: 1, date: 1, _id: 1}).sort({name: 1});
    res.send(user);

});

router.post('/find', async (req, res)=>{
    const error = !req.body.hasOwnProperty('email') ? true : false;

    if(error) res.status(400).send('Bad Request');
    // check if users available
    const user = await User.find({email: req.body.email}).select({name: 1, email: 1, date: 1, _id: 1}).sort({name: 1});
    res.send(user);

});

// get single user
router.get('/me', auth, async (req, res)=>{
    // check if genres available
    const user = await User.findById(req.user._id).select('-password');
    res.send(user); 

});

// adding a new user
router.post('/', async (req, res) => {

    const {error} = validate(req.body);

    if(error) res.status(404).send(error.details[0].message);

    // look up the user
    let user = await User.findOne({email: req.body.email});

    if(user){ res.status(400).send('User already registered!');}

     user = new  User(_.pick(req.body, ['name', 'email', 'password']));

     const salt = await bcrypt.genSalt(15);
     user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    // before sending response to the client, please generate the token
    //const token = jwt.sign({_id: user._id}, config.get('jwtPrivateKey'));
    const token = user.generateAuthToken();

    // add token into user  and return it
    user['webtoken'] = token;

   res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'webtoken', '_id']));
    
});


router.put('/:id', auth, async (req, res) => {

    const id = req.params.id;

    const {error} = validate(req.body);
    if(error) res.status(404).send(error.details[0].message);

    const user = await User.findByIdAndUpdate(id, {
        $set:{
            name: req.body.name,
            email: req.body.email,
            password:  req.body.password
        }
      }, {new : true});

      if(!user) res.status(404).send(`user with id ${id} not found!`);

      res.send(user);
});

// delete a genre
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const user = await User.findByIdAndRemove(id);
    if(!user) res.status(404).send(`user with id ${id} not found!`);
    res.send(user);
});
// listen at a port

module.exports = router;