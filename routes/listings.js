const auth = require('../middleware/auth');
// load lodash
const _ = require('lodash');
// require model
const {Listing, validate} = require('../model/listings');

// require express
const express = require('express');

const router = express.Router();

// request for all customers
router.get('/', async (req, res)=>{
    // check if genres available
    const list = await Listing.find().select({title: 1, images: 1, price: 1, _id: 1, categoryId: 1, userId: 1, location: 1, date: 1}).sort({title: 1});
    res.send(list);

});

router.post('/find', async (req, res)=>{
    const error = !req.body.hasOwnProperty('id') ? true : false;

    if(error) res.status(400).send('Bad Request');
    // check if users available
    const list = await Listing.findOne({_id: req.body.id}).sort({title: 1});
    res.send(list);

});


// adding a new user
router.post('/', async (req, res) => {

    const {error} = validate(req.body);

    if(error) res.status(404).send(error.details[0].message);

    // look up the user
    let list = await Listing.findOne({title: req.body.title});

    if(list){ res.status(400).send('Listing already added!');}

     list = new  Listing(_.pick(req.body, ["title", "images", "price", "categoryId", "userId", "location"]));

    await list.save();

   res.send(_.pick(list, ["title", "images", "price", "categoryId", "userId", "location", '_id', 'date']));
    
});


router.put('/:id', auth, async (req, res) => {

    const id = req.params.id;

    const {error} = validate(req.body);
    if(error) res.status(404).send(error.details[0].message);

    const list = await Listing.findByIdAndUpdate(id, {
        $set:{
            ...req.body
        }
      }, {new : true});

      if(!list) res.status(404).send(`Listing with id ${id} not found!`);

      res.send(list);
});

// delete a genre
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const list = await Listing.findByIdAndRemove(id);
    if(!list) res.status(404).send(`listing with id ${id} not found!`);
    res.send(list);
});
// listen at a port

module.exports = router;