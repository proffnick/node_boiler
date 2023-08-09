const auth      = require('../middleware/auth');
const _         = require('lodash');
const cors      = require('cors');

const {Orders, validate}        = require('../model/orders');

// require express
const express   = require('express');

const router    = express.Router();
                router.all('*', cors());


router.get('/', auth, async (req, res) => {
    // name
    const query = (req?.query?.qr) ? JSON.parse(decodeURI(req?.query.qr)): null;
    const orders = query ?  await Orders.findOne(query).select(
                {_id: 1, 
                item:1, 
                itemDesc: 1,
                distance:1, 
                quantity:1, 
                weight:1, 
                pickup:1, 
                deliver:1, 
                customer:1, 
                rider:1, 
                cost:1, 
                status:1, 
                state:1, 
                date:1}).sort({date: 1}) : 
                await Orders.find().select(
                {_id: 1, 
                item:1, 
                itemDesc: 1,
                distance:1, 
                quantity:1, 
                weight:1, 
                pickup:1, 
                deliver:1, 
                customer:1, 
                rider:1, 
                cost:1, 
                status:1, 
                riderEnded: 1,
                customerConfirmed:1,
                state:1, 
                date:1}).sort({date: 1});
    res.send(orders);
});

router.get('/new_orders', auth, async (req, res) => {
    // name
    //console.log("Was this called at all ?");
    const orders = await Orders.find({$and: [{status: false}, {state: 'requested'}]}).select({_id: 1, item:1, itemDesc:1,distance:1, quantity:1, weight:1, pickup:1, deliver:1, customer:1, rider:1, cost:1, status:1, state:1, date:1,riderEnded:1,customerConfirmed:1}).sort({date: 1});
    //console.log(orders, "gotten orders");
    res.send(orders);
});


router.get('/count-all-orders', auth, async (req, res) => {
    try {   
       const dt = (req.query?.where) ? JSON.parse(decodeURIComponent(req.query.where)): {};
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

// find by ID

router.get('/:id', auth, async (req, res) => {
    try {
        const orders = await Orders.findOne({_id: req.params.id});

        if(!orders)return res.status(404).send({error: true, message: "Orders not found!"});
    
        res.send(orders); 
    } catch (error) {
        console.log(error.message, 'Error finding Order');
        res.status(404).send({error: true, message: `Error finding Order: ${error.message}`});
    }
    
});

router.get('/:by/:id', auth, async (req, res) => {
    try {
        const by    = req.params.by ? req.params.by: 'customer';
        let obj     = {};
        obj[by]     = req.params.id;
    
        if(req?.query?.and){
            obj = {$and: [{...obj}, {...JSON.parse(decodeURIComponent(req?.query?.and))}]}
            //console.log(JSON.stringify( obj ), 'main');
        }
        const order = await Orders.findOne({...obj});
    
        if(!order)return res.status(404).send({error: true, message: "Order not found!"});
    
        res.send(order); 
    } catch (error) {
        res.status(404).send({error: true, message: `Error finding Order: ${error.message}`}); 
    }

});

router.get('/fetch/orderlist/:customer', auth, async (req, res) => {
    // check if genres available
    const perPage = parseInt(req.query.perPage);
    const page    = parseInt(req.query.page);
    //console.log(JSON.stringify(type), 'the requested type');

    if(!perPage || !page) return res.status(404).send({error: true, message: 'No page nor per page!'});

   // console.log(req.params.customer, 'The customer');

    const orders = await Orders
                    .find({customer: req.params.customer})
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .select({item:1,itemDesc: 1, quantity:1, distance: 1, weight:1, pickup:1, deliver:1, customer:1, rider:1, cost:1, status:1, state:1, date:1,riderEnded:1,customerConfirmed:1})
                    .sort({date: -1});
    res.send(orders);
});

// fetch existing order
router.get('/fetch/existing-order/:customer', auth, async (req, res) => {
    try {
        const order = await Orders
                        .findOne({$and: 
                                [
                                    {customer: req.params.customer}, 
                                    {state: {$in: ['intransit', 'pending', 'delivered', 'requested']}},
                                    {status: false},
                                    {customerConfirmed: false}
                                ]})
                        .select({
                            item:1,
                            itemDesc: 1, 
                            quantity:1, 
                            distance: 1, 
                            weight:1, 
                            pickup:1, 
                            deliver:1, 
                            customer:1, 
                            rider:1, 
                            cost:1, 
                            status:1, 
                            state:1,
                            riderEnded: 1, 
                            customerConfirmed:1,
                            date:1})
                        .sort({lastUpdated: -1});
         //console.log(order, typeof order, 'finding in mongooese');

        if(!order) return res.status(404).send({error: true, message: "No order found"});

        res.send(order);
    } catch (error) {
        res.status(404).send({error: true, message: `Error: ${error.message}`});
    }
});

// fetch existing order for rider
router.get('/fetch/order-for-rider/:rider', auth, async (req, res) => {
    try {
        const order = await Orders
                        .findOne({$and: 
                                [
                                    {rider: req.params.rider}, 
                                    {state: {$in: ['intransit', 'delivered']}},
                                    {$or: [{status: false}, {status: true}]},
                                    {riderEnded: false}
                                ]})
                        .select({
                            item:1,
                            itemDesc: 1, 
                            quantity:1, 
                            distance: 1, 
                            weight:1, 
                            pickup:1, 
                            deliver:1, 
                            customer:1, 
                            rider:1, 
                            cost:1, 
                            status:1, 
                            state:1,
                            riderEnded:1, 
                            customerConfirmed:1,
                            date:1})
                        .sort({lastUpdated: -1});

        if(!order) return res.status(404).send({error: true, message: "No order found"});

        res.send(order);
    } catch (error) {
        res.status(404).send({error: true, message: `Error: ${error.message}`});
    }
});

// details example for others
router.get('/example/:customer', auth, async (req, res)=>{
    // check if genres available
    const perPage = parseInt(req.query.perPage);
    const page    = parseInt(req.query.page);
    const options = (req.query?.options) ? (req.query?.options): false;

    if(isNaN(perPage) || isNaN(page) || !req.params.hasOwnProperty('customer')) res.status(400).send({error: true, message: 'Bad Request', status: false});

    let type    = req.query.type === 'wallet' ? {$and: 
                                                [
                                                    {customer: req.params.customer}, 
                                                    {$or: [{_type: 'debit'}, 
                                                    {_type: 'credit'}]}
                                                ]
                                                }: null;
    if(options && req.query.type === 'wallet'){
        const opt         = JSON.parse(decodeURI(options));
        const currentdate = (new Date()).getDate();
        const compared    = (new Date(opt.date)).getDate();
        const sentDate    = (new Date(opt.date));

        let parts         = [];

        if(currentdate !== compared){
            parts.push({date: {$lte: sentDate } });
        }

        if(opt.hasOwnProperty('options')){
            const [credit, debit] = opt.options;
            const or = [];
            if(credit.selected){
                or.push({_type: 'credit'});
            }
            if(debit.selected){
                or.push({_type: 'debit'});
            }

            if(or.length){
                parts.push({$or: [...or]});
            }
        }

        if(parts.length){
            type = {$and: [{customer:  req.params.customer}, ...parts]};
        }

        
    }

    //console.log(JSON.stringify(type), 'the requested type');

    const notes = await Notifications
                    .find(!type ? {customer: req.params.customer}: type)
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .select({item:1, quantity:1, weight:1, pickup:1, deliver:1, customer:1, rider:1, cost:1, status:1, state:1, date:1})
                    .sort({date: -1});
    res.send(notes);
});


router.post('/', async (req,  res) => {
    const {error} = validate(req.body);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});
     // look up the user
     let orders = null;

     orders = new Orders(_.pick(req.body, ["item", "itemDesc", "distance", "quantity", "weight", "pickup", "deliver", "customer", "cost"])); // pick

     await orders.save();

     res.send(_.pick(orders, ["_id", "item","itemDesc", "quantity", "weight", "distance", "pickup", "deliver", "customer", "rider", "cost", "status", "state", "date", "riderEnded", "customerConfirmed"])); // pick
});


router.put('/:id', auth, async (req, res) => {
    const id = req.params.id;

    
    if(!req.body) return res.status(404).send({error: true, message: 'No request object'});

    //console.log(req.body)

    const orders = await Orders.findByIdAndUpdate(id, {
        $set:{
            ...req.body
        }
      }, {new : true});

      if(!orders) return res.status(404).send({error: true, message: `Order with id ${id} not found!`});

      res.send(orders);
});

// delete a constant
router.delete('/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const delivered = Orders.findOne(id);
        if((delivered && ((delivered?.riderEnded) === true && (delivered?.rider) )) || (delivered?.state) === 'delivered' ){ return res.status(502).send({error: true, message: "Can't remove "});}
        const orders = await Orders.findByIdAndDelete(id);
        if(!orders) res.status(404).send({error: true, message: `Order with id ${id} not found!`});
        res.send(orders);  
    } catch (error) {
        res.status(404).send({error: true, message: error.message});
    }

});

module.exports = router;



