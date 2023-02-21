const auth      = require('../middleware/auth');
const config    = require('config');
const cors      = require('cors');
const express   = require('express');
const router    = express.Router();
                router.all('*', cors());
const { apiClientBank } = require('../api/bankClient');
const { apiClient }     = require('../api/client');

router.get('/banks', auth, async (req, res) => {
    const bl = await apiClientBank.get('/bank?currency=NGN');
    if(!bl.ok) res.status(404).send({error: true, message: bl?.data});

    res.send(bl.data);
});

router.post('/verify-account', auth, async (req, res) => {
    try {
        const ad = await apiClientBank.get(`/bank/resolve?account_number=${req.body.account}&bank_code=${req.body.code}`);
        if(!ad.ok) res.status(404).send({error: true, message: ad?.data});
        res.send(ad.data);
    } catch (error) {
        res.status(500).send({error: true, message: error.message});
    }
});

router.post('/create-recipient', auth, async (req, res) => {
    /*
        Structure Of Body
        "type":"nuban",
        "name" : "John Doe",
        "account_number": "0001234567",
        "bank_code": "058",
        "currency": "NGN"
    */
    try {
        const rd = await apiClientBank.post(`/transferrecipient`, req.body);
        if(!rd.ok) res.status(404).send({error: true, message: rd?.data});
        res.send(rd.data);
    } catch (error) {
        res.status(500).send({error: true, message: error.message});
    }
});

router.post('/init-transfer', auth, async (req, res) => {
    /*
        Structure Of Body
        {
        "source": "balance",
        "amount": 3794800,
        "recipient": "RCP_t0ya41mp35flk40", // from create receipient
        "reason": "Holiday Flexing"
        }
    */
    try {
        const trf = await apiClientBank.post(`/transfer`, req.body);
        if(!trf.ok) res.status(404).send({error: true, message: trf?.data?.message});
        // id success, add to list of pending transfers
        // I can get user details
        //console.log(trf?.data, 'data from transfer');

            const transferred = await apiClient.post('/transfer', {
                recipient_code: req.body.recipient,
                transfer_code:  trf?.data?.data?.transfer_code,
                reference: trf?.data?.data?.reference,
                amount: req.body.amount,
                user_id: req.user._id
            });

            //console.log(transferred.data, "Trnsfer Logged!");

            //set notification
            await apiClient.post('/notifications', {
                _type: "GENERAL",
                _amount:  req.body.amount,
                _note: `Your transfer request was queued successfully. Tran Ref: ${trf?.data?.data?.reference}. You will be notified on the status shortly!`,
                _userid: req.user._id
            });
        // req.user._id gives user's ID
        // use hook to check and deduct customer account appropriately
        res.send(trf.data);
    } catch (error) {
        res.status(500).send({error: true, message: error.message});
    }
});

router.post('/transfer-hook', auth, async (req, res) => {
    const data = req.body;
    try {
        // do whatever you want with the body http://192.168.43.66:5555/api/transfers/transfer-hook
        console.log(data);
    } catch (error) {
        res.status(500).send({error: true, message: error.message});
    }
});



module.exports = router;