const auth      = require('../middleware/auth');
const _         = require('lodash');
const cors      = require('cors');

const {Transfers, validate}        = require('../model/transfer');

// require express
const express   = require('express');

const router    = express.Router();
                router.all('*', cors());


router.get('/', auth, async (req, res) => {
    // name
    const transfers = await Transfers.find().select({}).sort({date: 1});
    res.send(transfers);
});

// find by ID

router.get('/:any', async (req, res) => {
    try {
        const any = JSON.parse(decodeURIComponent( req.params.any ));
        const transfers = await Transfers.findOne({...any});
        if(!transfers) return res.status(404).send({error: true, message: "Transfer not found!"});

        res.send(transfers);
    } catch (error) {
        res.status(500).send({error: true, message: error.message});   
    }
    
});


router.post('/', async (req,  res) => {
    const {error} = validate(req.body, true);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});
     // look up the user
     let transfers = await Transfers.findOne({recipient_code: req.body.recipient_code}); // search

     if(transfers){ return res.status(400).send({error: true, message: 'Transfer Already Added'});}

     transfers = new Transfers(_.pick(req.body, ["recipient_code", "amount", "user_id", "transfer_code", "reference"])); // pick

     await transfers.save();

     res.send(_.pick(transfers, ["recipient_code", "amount", "user_id", "transfer_code", "status", "reference"])); // pick
});


router.put('/:id', auth, async (req, res) => {
    const id = req.params.id;

    if(!req.body) return res.status(404).send({error: true, message: "invalid request"});

    //console.log(req.body)

    const transfers = await Transfers.findByIdAndUpdate(id, {
        $set:{
           ...req.body // update body
        }
      }, {new : true});

      if(!transfers) return res.status(404).send({error: true, message: `Transfer with id ${id} not found!`});

      // test push notofication
      //pushNotification([req.body.pushNotificationToken], "We have a message for you!");

      res.send(transfers);
});

// delete a constant
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const transfers = await Transfers.findByIdAndRemove(id);
    if(!transfers) res.status(404).send({error: true, message: `Transfer with id ${id} not found!`});
    res.send(transfers);
});

module.exports = router;



