const auth      = require('../middleware/auth');
const _         = require('lodash');
const cors      = require('cors');
const {Banks, validate}        = require('../model/banks');
// require express
const express   = require('express');
const router    = express.Router();
                router.all('*', cors());


router.get('/', async (req, res) => {
    // name
    const banks = await Banks.find().select({}).sort({date: 1});
    res.send(banks);
});

// find by ID

router.get('/:id', async (req, res) => {
    const banks = await Banks.findOne({_id: req.params.id});

    if(!banks) return res.status(404).send({error: true, message: "Bank not found!"});

    res.send(banks);
});


router.post('/', async (req,  res) => {
    const {error} = validate(req.body);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});
     // look up the user
     let banks = await Banks.findOne({$and: [{account_name: req.body.account_name}, {user_id: req.body.user_id}]}); // search

     if(banks){ return res.status(400).send({error: true, message: 'Bank Already Added'});}

     banks = new Constants(_.pick(req.body, ["account_name", "account_number", "bank_code", "user_id"])); // pick

     await banks.save();

     res.send(_.pick(banks, ["account_type","account_name","account_number","bank_code","user_id","account_currency","_id"])); // pick
});


router.put('/:id', auth, async (req, res) => {
    const id = req.params.id;

    const {error} = validate(req.body, true, true);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});

    //console.log(req.body)

    const banks = await Banks.findByIdAndUpdate(id, {
        $set:{
            ...req.body
        }
      }, {new : true});

      if(!banks) return res.status(404).send({error: true, message: `Bank with id ${id} not found!`});

      res.send(banks);
});

// delete a constant
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const banks = await Banks.findByIdAndRemove(id);
    if(!banks) res.status(404).send({error: true, message: `Bank with id ${id} not found!`});
    res.send(banks);
});

module.exports = router;



