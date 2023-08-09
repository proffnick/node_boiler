const auth      = require('../middleware/auth');
const _         = require('lodash');
const cors      = require('cors');

const {Wallets, validate}        = require('../model/wallets');

// require express
const express   = require('express');

const router    = express.Router();
                router.all('*', cors());


router.get('/', auth, async (req, res) => {
    // name
    const wallets = await Wallets.find().select({
                balance: 1, 
                user_id: 1, 
                wallet_id: 1, 
                wallet_bank_name: 1, 
                wallet_bank_code: 1, 
                wallet_account_number: 1, 
                ref: 1,
                _id: 1}).limit(500).sort({date: 1});

    res.send(wallets);
});

// find by ID
router.get('/get-all-balances', auth, async (req, res) => {
    try {   
       Wallets.aggregate([
            {
              $group: {
                _id: null,
                totalBalance: { $sum: '$balance' },
              },
            },
          ])
        .then((result) => {
            if (result.length > 0) {
            const totalBalance = result[0].totalBalance;
            return res.status(200).send({status: true, balance: totalBalance});
            } else {
             return res.status(404).send({status: true, balance: 0});
            }
        })
        .catch((error) => {
           return res.status(500).send({status: false, message: error?.message});
        });

    } catch (error) {
     res.status(500).send({status: false, message: error?.message}); 
    }
});

router.get('/:id', async (req, res) => {
    const wallets = await Wallets.findOne({_id: req.params.id});

    if(!wallets)return res.status(404).send({error: true, message: "Wallet not found!"});

    res.send(wallets);
});
router.get('/:by/:id', async (req, res) => {
    const by    = req.params.by ? req.params.by: 'user_id';
    const obj   = {};
    obj[by]     = req.params.id;

    //console.log(obj, 'testing income input');
    const wallets = await Wallets.findOne({...obj});

    if(!wallets) return res.status(404).send({error: true, message: "Wallet not found!"});

    res.send(wallets);
});

router.post('/', async (req,  res) => {
    const {error} = validate(req.body);
    if(error) return res.status(404).send({error: true, message: error.details[0].message});
     // look up the user
     let wallets = await Wallets.findOne({wallet_id: req.body.wallet_id}); // search

     if(wallets){
          return res.send(wallets);
        }

     wallets = new Wallets(_.pick(req.body, ["balance", "user_id", "wallet_id", "wallet_account_number", "wallet_bank_name", "wallet_bank_code", "ref"])); // pick

     await wallets.save();

     res.send(_.pick(wallets, ["balance", "user_id", "wallet_id", "wallet_account_number", "wallet_bank_name", "wallet_bank_code", "_id", "ref"])); // pick
});

router.put('/:id', auth, async (req, res) => {
    const id = req.params.id;

    console.log(id, 'the wallet ID');

    const found = await  Wallets.findOne({_id: id});
    if(!found) return res.status(404).send({error: true, message: "Wallet not found!"});

    //console.log(req.body)

    const wallets = await Wallets.findByIdAndUpdate(id, {
        $set:{
            ...req.body
        }
      }, {new : true});

      if(!wallets) return res.status(404).send({error: true, message: `Wallet with id ${id} not found!`});

      // test push notofication
      //pushNotification([req.body.pushNotificationToken], "We have a message for you!");

      res.send(wallets);
});

// delete a constant
router.delete('/:id', auth, async (req, res) => {
    const id = req.params.id;
    const wallets = await Wallets.findByIdAndRemove(id);
    if(!wallets) res.status(404).send({error: true, message: `Wallet with id ${id} not found!`});
    res.send(wallets);
});

module.exports = router;



