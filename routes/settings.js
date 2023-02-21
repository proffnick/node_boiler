const auth      = require('../middleware/auth');
const _         = require('lodash');
const cors      = require('cors');

const {Settings, validate}        = require('../model/settings');

// require express
const express   = require('express');

const router    = express.Router();
                router.all('*', cors());


router.get('/', async (req, res) => {
    // setting
    const settings = await Settings.find().select({meansOfIdentity: 1, pricing: 1, date: 1, createdAt: 1}).sort({date: 1});
    res.send(settings);
});

// find by ID

router.get('/:id', async (req, res) => {
    const settings = await Settings.findOne({_id: req.params.id});

    if(!settings)return res.status(404).send({error: true, message: "Setting not found!"});

    res.send(settings);
});


router.post('/', async (req,  res) => {
    const {error} = validate(req.body);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});
     // look up the user
    let settings = await Settings.findOne({meansOfIdentity: req.body.meansOfIdentity}); // search

    if(settings){ return res.status(400).send({error: true, message: 'Setting Already Added'});}

    settings = new Settings(_.pick(req.body, ["meansOfIdentity", "pricing"])); // pick

    await settings.save();

    res.send(_.pick(settings, ["meansOfIdentity","pricing", "_id", "date"])); // pick
});


router.put('/:id', auth, async (req, res) => {
    const id = req.params.id;

    const {error} = validate(req.body, true);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});

    //console.log(req.body)

    const settings = await Settings.findByIdAndUpdate(id, {
        $set:{
           ...req.body
        }
      }, {new : true});

      if(!settings) return res.status(404).send({error: true, message: `Setting with id ${id} not found!`});

      res.send(settings);
});

// delete a constant
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const settings = await Settings.findByIdAndRemove(id);
    if(!settings) res.status(404).send({error: true, message: `Setting with id ${id} not found!`});
    res.send(settings);
});

module.exports = router;



