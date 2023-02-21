const auth      = require('../middleware/auth');
const _         = require('lodash');
const cors      = require('cors');

const {Names, validate}        = require('../model/names');

// require express
const express   = require('express');

const router    = express.Router();
                router.all('*', cors());


router.get('/', async (req, res) => {
    // name
    const names = await Names.find().select({}).sort({date: 1});
    res.send(names);
});

// find by ID

router.get('/:id', async (req, res) => {
    const names = await Names.findOne({_id: req.params.id});

    if(!names)return res.status(404).send({error: true, message: "Constant not found!"});

    res.send(names);
});


router.post('/', async (req,  res) => {
    const {error} = validate(req.body);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});
     // look up the user
     let names = await Names.findOne({title: req.body.title}); // search

     if(names){ return res.status(400).send({error: true, message: 'Constant Already Added'});}

     names = new Constants(_.pick(req.body, ["title", "desc"])); // pick

     await names.save();

     res.send(_.pick(names, ["title", "desc", "_id", "date"])); // pick
});


router.put('/:id', auth, async (req, res) => {
    const id = req.params.id;

    const {error} = validate(req.body, true, true);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});

    //console.log(req.body)

    const names = await Names.findByIdAndUpdate(id, {
        $set:{
            title: req.body.title,// update body
            desc: req.body.desc // update body
        }
      }, {new : true});

      if(!names) return res.status(404).send({error: true, message: `Name with id ${id} not found!`});

      // test push notofication
      //pushNotification([req.body.pushNotificationToken], "We have a message for you!");

      res.send(names);
});

// delete a constant
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const names = await Names.findByIdAndRemove(id);
    if(!names) res.status(404).send({error: true, message: `Name with id ${id} not found!`});
    res.send(names);
});

module.exports = router;



