const auth      = require('../middleware/auth');
const _         = require('lodash');
const cors      = require('cors');

const {Notifications, validate}        = require('../model/notifications');

// require express
const express   = require('express');

const router    = express.Router();
                router.all('*', cors());


router.get('/', auth, async (req, res) => {
    // name
    const notifications = await Notifications.find().select({_type: 1, _amount: 1, _note: 1, _action: 1, _read: 1, _date: 1, _userid: 1}).sort({_date: 1});
    res.send(notifications);
});

router.get('/count-new', auth, async (req, res)=> {
    try {
        if(!req.query.qr) return res.status(400).send({error: true, message: 'Bad Request', status: false});
    
        let term = JSON.parse(decodeURIComponent(req.query.qr));
        //console.log(JSON.stringify(term), 'new');
        const docs = await Notifications.countDocuments(term);
    
        res.send({count: docs});
    } catch (error) {
        res.status(500).send({error: true, message: `Server Error: ${error.message}`, status: false});
    }

});

router.post('/fetch-transactions', auth, async (req, res) => {
    try {
        let query = {};
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

        if(Object.keys(query).length && child !== '_type'){
            query[`$and`]  = {$or: [{_type: "CREDIT"}, {_type: "DEBIT"}]};
        }else if(child !== '_type'){
            query = {$or: [{_type: "CREDIT"}, {_type: "DEBIT"}]};
        }

        const notes = await Notifications
        .find(query)
        .limit(limit)
        .skip( !(isNaN(skip)) ? skip: 0 )
        .select({
            _type: 1, 
            _amount: 1, 
            _note: 1, 
            _action: 1, 
            _read: 1, 
            _date: 1, 
            _userid: 1,
            _id: 1      
        }).sort({date: -1});
        
        // total details
        const total = await Notifications.countDocuments(query);

        return res.status(200).send({status: true, total: total, data: notes});

    } catch (error) {
        console.log(error, error?.message);
      return res.status(500).send({status: false, message: error?.message});  
    }
});

// find by ID

router.get('/:id', async (req, res) => {
    const notifications = await Notifications.findOne({_id: req.params.id});

    if(!notifications)return res.status(404).send({error: true, message: "Notification not found!"});

    res.send(notifications);
});


router.get('/notes/:_userid', auth, async (req, res)=>{
    // check if genres available
    try {
        const perPage = parseInt(req.query.perPage);
        const page    = parseInt(req.query.page);
        const options = (req.query?.options) ? (req.query?.options): false;
        const counter = JSON.parse((req?.query?.count));
    
        if(isNaN(perPage) || isNaN(page) || !req.params.hasOwnProperty('_userid')) res.status(400).send({error: true, message: 'Bad Request', status: false});
    
        let type    = null;
        let condition = {};
    
        //{_userid: req.params._userid},
        switch(req.query.type){
            case 'wallet':
                type = {$or: [{_type: 'DEBIT'}, {_type: 'CREDIT'}]};
            break;
            case 'credit':
                type = {_type: 'CREDIT'};
            break;
            case 'debit':
                type = {_type: 'DEBIT'};
            break;
            case 'update':
                type = {_type: 'UPDATE'};
            break;
            case 'order':
                type = {_type: 'ORDER'};
            break;
        }
                                                    
        if(options){
            // options has date and and conditions
    
            const opt         = JSON.parse(decodeURI(options));
            const startdate   = (new Date(opt.date[0].start)).getDate();
            const enddate     = (new Date(opt.date[1].end)).getDate();
            //console.log(JSON.stringify(opt), 'opts'); // 
            let parts         = [];
            let cond          = [];
    
            if(startdate !== enddate){
                parts.push({_date: {$gte: (new Date(opt.date[0].start)) } });
                parts.push({_date: {$lte: (new Date(opt.date[1].end)) } });
            }else if((opt?.date?.start)) {
                parts.push({_date: {$gte: (new Date(opt.date[0].start)) } });
            }
    
            //console.log(JSON.stringify(parts), 'dates'); // 
    
            if((opt?.condition)){
                cond = [...opt.condition];
            }
            let construct = [];
            if(type) {
                construct.push({$and: [type]})
            }
    
            if(parts.length){
               construct.push({$and: [...parts]});
            }
    
            if(cond){
                construct.push({$and: [...cond]});
            }
    
            if(construct){
                condition = {$and: [...construct]}
            }
    
            
        }
    
        // if no condition and we have type, then
        if(!Object.keys(condition).length && type){
            condition = {$and: [type, {_userid: req.params._userid}]}
        }
    
        if(counter){
            let note = await Notifications.count(!condition ? {_userid: req.params._userid}: condition);
            res.send({count: note});
            return;
        }
        //console.log(JSON.stringify(condition), 'the requested type');
        //console.log(((page - 1) * perPage), "skip");

        //console.log(JSON.stringify(condition), 'search condition');

        const notes = await Notifications
                        .find(!condition ? {_userid: req.params._userid}: condition)
                        .skip((page - 1) * perPage)
                        .limit(perPage)
                        .select({_id: 1, _type: 1, _amount: 1, _note: 1, _action: 1, _read: 1, _date: 1, _userid: 1})
                        .sort({createdAt: -1});
        res.send(notes);
    } catch (error) {
        res.status(500).send({error: true, message: 'Internal Srever error: '+error.message, status: false});  
    }

});

router.get('/count_all', auth, async (req, res)=> {
    // check if genres available
    //if(!req.params.code) {res.status(400).send({error: true, message: 'Bad Request', status: false}); return;}
    //{referred_by: req.params.code}
    let term = {};
    if(req.query.term){term = JSON.parse(decodeURIComponent(req.query.term))}
    if(term.hasOwnProperty('$and')){
        let sAnd = term.$and[0];
        let start = sAnd['date']['$gte'];
        let end   = sAnd['date']['$lte'];
        sAnd['date']['$gte'] = new Date(start);
        sAnd['date']['$lte'] = new Date(end);

        // if they are equal remove less than replace with equal
        if(start === end){
            delete sAnd.date.$lte;
            //console.log('They were qual therefore one has been deleted');
        }

        term['$and'][0] =  sAnd;
    }

    const docs = await notifications.countDocuments(term);

    res.send({count: docs});
});


router.get('/sum_amount', auth, async (req, res) => {
    let term = {amount: {$gt: 0}};
    if(req.query.term){term = JSON.parse(decodeURIComponent(req.query.term))}
    if(term.hasOwnProperty('$and')){
        let sAnd = term.$and[0];
        let start = sAnd['date']['$gte'];
        let end   = sAnd['date']['$lte'];
        sAnd['date']['$gte'] = new Date(start);
        sAnd['date']['$lte'] = new Date(end);

        // if they are equal remove less than replace with equal
        if(start === end){
            delete sAnd.date.$lte;
            //console.log('They were qual therefore one has been deleted');
        }

        term['$and'][0] =  sAnd;
    }



    let note =   await Notifications.aggregate([
            { $match: term },
            { $group: { _id: null, amount: { $sum: "$_amount" } } }
        ]);
    res.send({sum: note});
});

router.get('/pending/:customer', auth, async (req, res) => {
    let customer = req.params.customer;
    if(!customer) return res.status(404).send({error: true, message: "Customer Id needed"});
    let note =   await Notifications.count({$and: [{_userid: customer}, {_read: false}] });
    res.send({count: note});
});


router.post('/', async (req,  res) => {
    const {error} = validate(req.body, true);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});
     let notifications = new Notifications(_.pick(req.body, ["_type", "_amount","_note", "_action", "_userid"])); // pick
     await notifications.save();
     res.send(_.pick(notifications, ["_type", "_amount","_note", "_action", "_read", "_date", "_userid", "_id"])); // pick
});


router.put('/:id', auth, async (req, res) => {
    const id = req.params.id;

    if(!Object.keys(req.body).length || !id) return res.status(404).send({error: true, message: "Invalid request"});

    //console.log(req.body)

    const notifications = await Notifications.findByIdAndUpdate(id, {
        $set:{
           ...req.body
        }
      }, {new : true});

      if(!notifications) return res.status(404).send({error: true, message: `Notification with id ${id} not found!`});

      // test push notofication
      //pushNotification([req.body.pushNotificationToken], "We have a message for you!");

      res.send(notifications);
});

// delete a constant
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const notifications = await Notifications.findByIdAndRemove(id);
    if(!notifications) res.status(404).send({error: true, message: `Notification with id ${id} not found!`});
    res.send(notifications);
});

module.exports = router;



