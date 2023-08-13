const auth      = require('../middleware/auth');
const _         = require('lodash');
const cors      = require('cors');

const {Constants, validate}        = require('../model/constants');

// require express
const express   = require('express');

const router    = express.Router();
                router.all('*', cors());


router.get('/', async (req, res) => {
    const consts = await Constants.find().select({title: 1, desc: 1}).sort({date: 1});
    res.send(consts);
});

router.post('/fetch-constants', auth, async (req, res) => {
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

        const consts = await Constants
        .find(query)
        .limit(limit)
        .skip( !(isNaN(skip)) ? skip: 0 )
        .select({
            _id: 1,
            title: 1, 
            desc: 1, 
            lastUpdated: 1, 
            date: 1        
        }).sort({date: -1});
        
        // total details
        const total = await Constants.countDocuments(query);

        //console.log(users, total);

        return res.status(200).send({status: true, total: total, data: consts});

    } catch (error) {
      return res.status(500).send({status: false, message: error?.message});  
    }
});

// find by ID

router.get('/:id', async (req, res) => {
    const consts = await Constants.findOne({_id: req.params.id});

    if(!consts)return res.status(404).send({error: true, message: "Constant not found!"});

    res.send(consts);
});

// find by title
router.get('/find/:title',  async (req, res) => {
    const consts = await Constants.findOne({title: req.params.id});

    if(!consts)return res.status(404).send({error: true, message: "Constant not found!"});

    res.send(consts);
});

router.post('/', async (req,  res) => {
    const {error} = validate(req.body);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});
     // look up the user
     let consts = await Constants.findOne({title: req.body.title});

     if(consts){ return res.status(400).send({error: true, message: 'Constant Already Added'});}

     consts = new Constants(_.pick(req.body, ["title", "desc"]));

     await consts.save();

     res.send(_.pick(consts, ["title", "desc", "_id", "date"]));
});


router.put('/:id', auth, async (req, res) => {
    const id = req.params.id;

    const {error} = validate(req.body, true, true);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});

    //console.log(req.body)

    const consts = await Constants.findByIdAndUpdate(id, {
        $set:{
            title: req.body.title,
            desc: req.body.desc
        }
      }, {new : true});

      if(!consts) return res.status(404).send({error: true, message: `Constant with id ${id} not found!`});

      // test push notofication
      //pushNotification([req.body.pushNotificationToken], "We have a message for you!");

      res.send(consts);
});

// delete a constant
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const consts = await Constants.findByIdAndRemove(id);
    if(!consts) res.status(404).send({error: true, message: `constant with id ${id} not found!`});
    res.send(consts);
});

module.exports = router;



