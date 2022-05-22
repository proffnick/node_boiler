const auth = require('../middleware/auth');
//const formData = require('../middleware/formData');
// load lodash
const _ = require('lodash');
// require model
const {Listing, validate} = require('../model/listings');
const cors = require('cors');
// require express
const express = require('express');

const router = express.Router();
            router.all('*', cors());

const multer    = require('multer');
const  path     = require('path');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'assets/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
  });
const upload    = multer({ storage: storage });
const config    = require('config');


// request for all listings
router.get('/', auth, async (req, res)=>{
    // check if genres available
    const list = await Listing.find().select({title: 1, images: 1, price: 1, _id: 1, categoryId: 1, userId: 1, location: 1, date: 1}).sort({title: 1});
    res.send(list);

});

router.post('/find', async (req, res)=>{
    const error = !req.body.hasOwnProperty('id') ? true : false;

    if(error) return  res.status(400).send({error: true, message: 'Bad Request'});
    // check if users available
    const list = await Listing.findOne({_id: req.body.id}).sort({title: 1});
    res.send(list);

});


// adding a new user
router.post('/', upload.array('images', 5),  async (req, res) => {

    if(!req.files.length){ 
        res.status(400).send({error: true, message: "You must provide at least one image"});
        return;
    }

    const files = req.files.map(file => ({
        url: config.get('assets')+'/'+file.filename, 
        thumbnailUrl: config.get('assets')+'/preview.jpg'
    }));

    console.log(files, req.files);

    req.body.images = files;

    
    const {error} = validate(req.body);

    if(error){
        console.log(error.details);
        res.status(404).send({error: true, message: error.details[0].message});
        return;
    }

    // look up the user
    let list = await Listing.findOne({title: req.body.title});

    // before any oter thing I need to log the images and location
    console.log(files);



    if(list){ return res.status(400).send({error: true, message:'Listing already added!'});}

     list = new  Listing(_.pick(req.body, ["title", "images", "price", "categoryId", "userId", "location"]));

    await list.save();

   res.send(_.pick(list, ["title", "images", "price", "categoryId", "userId", "location", '_id', 'date']));
    
});


router.put('/:id', auth, async (req, res) => {

    const id = req.params.id;

    const {error} = validate(req.body);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});

    const list = await Listing.findByIdAndUpdate(id, {
        $set:{
            ...req.body
        }
      }, {new : true});

      if(!list) return res.status(404).send({error: true, message: `Listing with id ${id} not found!`});

      res.send(list);
});

// delete a genre
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const list = await Listing.findByIdAndRemove(id);
    if(!list) return res.status(404).send({error: true, message: `Listing with id ${id} not found!`});
    res.send(list);
});
// listen at a port

module.exports = router;