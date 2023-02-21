const auth      = require('../middleware/auth');
const cors      = require('cors');
const moment    = require('moment');
const { sendMail, sendSMS, makeid } = require('../bin/helpers');
const config    = require('config');
const logger    = require('../middleware/winston');
const { apiClient }     = require('../api/client');
const pushNotification  = require('../utilities/pushNotifications');
// require express
const express   = require('express');
const router    = express.Router();
                router.all('*', cors());

const usersEndPoint         = 'users';
const ordersEndPoint        = 'orders';
const settingsEndPoint      = 'settings';
const notesEndPoint         = 'notifications';
const walletEndPoint        = 'wallets';

router.post('/', auth, async (req, res) => {
    try {
        

        if(!req.body.order_id) return res.status(404).send({error: true, message: "Invalud request!"});

        console.log("we got in here line 26");
        
        const order = await apiClient.get(ordersEndPoint+`/${req.body.order_id}`);
        if(!order.ok) return res.status(404).send({error: true, message: 'Order not found!'});
        const orderData = order.data;

        if(orderData.customerConfirmed === true) return res.status(400).send({error: true, message: 'Error: Order already approved by the customer'});

        // get the settings
        const appSettings = await apiClient.get(settingsEndPoint);
        if(!appSettings.ok) return res.status(404).send({error: true, message: 'Settings not found!'});
        
        // Calculate the amount
        const calculateRiderEarning = () => {
            
            if(typeof appSettings === 'object'){
                const [ settings ]  = appSettings.data;
                const { pricing }   = settings;
                const availablePackages = pricing.find(sets => parseFloat(orderData?.itemWeight) <= sets[Object.keys(sets)[0]]?.maxweight );
    
                if(availablePackages){
                    let packageObject   = null;
                    let riderPayPercent = 0;
                    
                    switch(Object.keys(availablePackages)[0]){
                        case 'basic':
                            packageObject   = availablePackages['basic'];
                            riderPayPercent = parseFloat(packageObject.riderpay);
                        break;
                        case 'standard':
                            packageObject   = availablePackages['standard'];
                            riderPayPercent = parseFloat(packageObject.riderpay);
                        break;
                        case 'super':
                            packageObject = availablePackages['super'];
                            riderPayPercent = parseFloat(packageObject.riderpay);
                        break;
                        case 'premium':
                            packageObject   = availablePackages['premium'];
                            riderPayPercent = parseFloat(packageObject.riderpay);
                        break;
                        case 'custom':
                            packageObject = availablePackages['custom'];
                            riderPayPercent = parseFloat(packageObject.riderpay);
                        break;
                        case 'special':
                            packageObject   = availablePackages['special'];
                            riderPayPercent = parseFloat(packageObject.riderpay);
                        break;
                    }
                    return riderPayPercent;
                }

                if(!availablePackages){
                    // not approved
                    return 20; // default rider pay 
                }
                
            }

            return 0;
        }
        // decalare rider paypersent 
        const riderPay = calculateRiderEarning();

        if(riderPay === 0) return res.status(404).send({error: true, message: 'Error getting settings'});
        console.log(riderPay, "the rider pay percentage");
        // Pay rider
        let rider     = await apiClient.get(usersEndPoint+`/${orderData?.rider}`);
        let customer  = await apiClient.get(usersEndPoint+`/${orderData?.customer}`);

        if(!rider.ok || !customer.ok) return res.status(404).send({error: true, message: 'Customer or rider not found!'});
        rider       = rider.data;
        customer    = customer.data;

        console.log(rider, customer, 'Customer <=> Rider');

        // calculate rider pay amount
        const riderPayAmount    = parseFloat(((riderPay / 100) * parseFloat(orderData.cost)));
        const psaPay            = (parseFloat(orderData.cost) - riderPayAmount); 

        // get the customer Wallet and the rider wallet
        const riderWallet       = (await apiClient.get(walletEndPoint+`/user_id/${rider?._id}`)).data;
        //charge customer wallet
        const customerWallet    = (await apiClient.get(walletEndPoint+`/user_id/${customer?._id}`)).data;
        console.log(riderWallet, "Wallet for rider");
        console.log(customerWallet, 'customer wallet');
        
        // charge customer
        await apiClient.put(walletEndPoint+`/${customerWallet._id}`, {
            balance: customerWallet.balance - parseFloat(orderData.cost),
            user_id: customerWallet.user_id,
            wallet_id: customerWallet.wallet_id,
            ref: makeid()
        });
        // pay rider update wallet
        await apiClient.put(walletEndPoint+`/${riderWallet._id}`, {
            balance: riderWallet.balance + riderPayAmount, // for DND SMS
            user_id: riderWallet.user_id,
            wallet_id: riderWallet.wallet_id,
            ref: makeid()
        });

        // update orders and set the required parameters on
        await apiClient.put(ordersEndPoint+`/${orderData._id}`, {
            status: true,
            state: 'delivered',
            customerConfirmed: true
        });

        // customer messages
        const cTitle    = `Order delivered!`;
        const message   = `Your order with the ID (${orderData._id}) has been delivered at the address specified. Thank you for chosing PSA logistics`;

         // customer messages
         const rTitle    = `Order delivered!`;
         const rMessage   = `You have successfully delivered the order (${orderData._id}) as requested.`;

        // send notification customer
        await apiClient.post(notesEndPoint, {
            _type: 'GENERAL',
            _amount: orderData.cost,
            _note: message,
            _userid: customer._id
        });
        // notify charge customer
        await apiClient.post(notesEndPoint, {
            _type: 'DEBIT',
            _amount: orderData.cost,
            _note: `You have been charged N${orderData.cost} for the delivery of your Items.`,
            _userid: customer._id
        });
        
        // send notification rider
        await apiClient.post(notesEndPoint, {
            _type: 'GENERAL',
            _amount: riderPayAmount,
            _note: rMessage,
            _userid: rider._id
        });
        // notify credit rider
        await apiClient.post(notesEndPoint, {
            _type: 'CREDIT',
            _amount:  riderPayAmount ,
            _note: `You have received N${ riderPayAmount } for the delivery made. OrderId: ${orderData._id}`,
            _userid: rider._id
        });

        // update PSA earnings
        await apiClient.post(notesEndPoint, {
            _type: 'CREDIT',
            _amount:  psaPay ,
            _note: `PSA has received N${ psaPay } for the delivery made by ${rider.firstName}(${rider.phoneNumber}). Order Id: ${orderData._id}`,
            _userid: config.get('psaObjectId')
        });

        // send mail rider
        //sendMail(rider.email, rTitle, rMessage).then(sent => console.log("email message sent", sent));
        // send mail to customer
        //sendMail(customer.email, cTitle, message).then(sent => console.log("email message sent", sent));

        // Update the notification for PSA payment
        const customerNoteId    = [customer?.pushNotificationToken];
        const riderNoteId       = [rider?.pushNotificationToken];
        if(riderNoteId){ 
            pushNotification(riderNoteId,rMessage, {}, `Order Delivered ${moment(new Date()).format('Do DDD, YYYY HH:mm:ss ')}`).then(sent => console.log('notification sent', sent));
        }

        if(customerNoteId){ 
            pushNotification(customerNoteId, message, {}, `Order Delivered ${moment(new Date()).format('Do DDD, YYYY HH:mm:ss ')}`).then(sent => console.log('notification sent', sent));
        }

        // Send notification to rider sms (if need be) and email if necessary
        sendSMS(rider.phoneNumber, `Congrats! You have received ${riderPayAmount} for your delivery. Your wallet balance now is N${riderWallet.balance + riderPayAmount}`, 'generic', 'PSALOGISTIC').then((sent) => console.log(sent.data, 'sms sent')).catch(error => console.log(error.message));
        
        res.send({success: true, message: 'successful trip', data: null});
    } catch (error) {
        console.log(`Error ending trip: ${error.message}`, error);
        logger.error(error.message, error);
    }
   
   res.status(500).send({error: true, message: 'internal server error'}); 
});

router.post('/end-trip', auth, async (req, res) => {
    try {
        if(!req.body.order_id) res.status(404).send({error: true, message: "Invalud request!"});
        // fins the order
        // get the order
        const order = await apiClient.get(ordersEndPoint+`/${req.body.order_id}`);
        if(!order.ok) return res.status(404).send({error: true, message: 'Order not found!'});
        const orderData = order.data;

        // find the user
        // find customer
         // Pay rider
         let rider     = await apiClient.get(usersEndPoint+`/${orderData?.rider}`); // rider
         let customer  = await apiClient.get(usersEndPoint+`/${orderData?.customer}`); //customer
 
         if(!rider.ok || !customer.ok) return res.status(404).send({error: true, message: 'Customer or rider not found!'});
         rider       = rider.data;
         customer    = customer.data;

        // check if the rider corresponds in both instances
        if(orderData?.customer !== customer._id || orderData?.rider !== rider._id) {
            return res.status(404).send({error: true, message: 'Customer or Rider did not correspond!'});  
        }
        // change the haspending request
        await apiClient.put(usersEndPoint+`/${rider._id}`, {hasPendingRequest: false});
        await apiClient.put(ordersEndPoint+`/${orderData._id}`, {state: 'delivered', riderEnded: true});
        // update order to delivered

        // notify customer
        // notify user
        // send notification customer
        await apiClient.post(notesEndPoint, {
            _type: 'GENERAL',
            _amount: orderData.cost,
            _note: `Rider has updated the order (${orderData._id}). The Rider indicated that the order has been marked as delivered`,
            _userid: customer._id
        });
        // notify charge customer
        await apiClient.post(notesEndPoint, {
            _type: 'GENERAL',
            _amount: orderData.cost,
            _note: `The Order (${orderData._id}) has been updated successfully!`,
            _userid: rider._id
        });
        // end request

        const customerNoteId    = [customer?.pushNotificationToken];
        const riderNoteId       = [rider?.pushNotificationToken];
        if(riderNoteId){ 
            pushNotification(riderNoteId,`The Order (${orderData._id}) has been updated successfully!`, {}, `Order Marked Delivered ${moment(new Date()).format('Do DDD, YYYY HH:mm:ss ')}`).then(sent => console.log('notification sent', sent));
        }

        if(customerNoteId){ 
            pushNotification(customerNoteId, `Rider has updated the order (${orderData._id}). The Rider indicated that the order has been marked as delivered`, {}, `Order Updated ${moment(new Date()).format('Do DDD, YYYY HH:mm:ss ')}`).then(sent => console.log('notification sent', sent));
        }

        res.send({success: true, message: 'Trip successfully ended!', data: null});
  
    } catch (error) {
        console.log(`Error ending trip: ${error.message}`, error);
        logger.error(error.message, error);
    }

});

router.post('/cancel-trip', auth, async (req, res) => {
    try {
        if(!req.body.order_id) res.status(404).send({error: true, message: "Invalud request!"});
        // fins the order
        // get the order
        const order = await apiClient.get(ordersEndPoint+`/${req.body.order_id}`);
        if(!order.ok) return res.status(404).send({error: true, message: 'Order not found!'});
        const orderData = order.data;

        // find the user
        // find customer
         // Pay rider
         let rider     = await apiClient.get(usersEndPoint+`/${orderData?.rider}`); // rider
         let customer  = await apiClient.get(usersEndPoint+`/${orderData?.customer}`); //customer
 
         if(!rider.ok || !customer.ok) return res.status(404).send({error: true, message: 'Customer or rider not found!'});
         rider       = rider.data;
         customer    = customer.data;

        // check if the rider corresponds in both instances
        if(orderData?.customer !== customer._id || orderData?.rider !== rider._id) {
            return res.status(404).send({error: true, message: 'Customer or Rider did not correspond!'});  
        }
        // change the haspending request
        await apiClient.put(usersEndPoint+`/${rider._id}`, {
            hasPendingRequest: false
        });

        await apiClient.put(ordersEndPoint+`/${orderData._id}`, {
            state: 'pending',
            status: false, 
            rider: null,
            riderEnded: false
        });
        // update order to delivered
        // notify customer
        // notify user
        // send notification customer
        await apiClient.post(notesEndPoint, {
            _type: 'GENERAL',
            _amount: orderData.cost,
            _note: `Rider has updated the order (${orderData._id}). The Rider has canceled the order, please wait or cacel and try again`,
            _userid: customer._id
        });

        // notify charge customer
        await apiClient.post(notesEndPoint, {
            _type: 'GENERAL',
            _amount: orderData.cost,
            _note: `The Order (${orderData._id}) has been cancelled successfully!`,
            _userid: rider._id
        });
        // end request

        const customerNoteId    = [customer?.pushNotificationToken];
        const riderNoteId       = [rider?.pushNotificationToken];
        if(riderNoteId){ 
            pushNotification(riderNoteId,`The Order (${orderData._id}) has been cancelled successfully!`, {}, `Order Marked Cancelled ${moment(new Date()).format('Do DDD, YYYY HH:mm:ss ')}`).then(sent => console.log('notification sent', sent));
        }

        if(customerNoteId){ 
            pushNotification(customerNoteId, `Rider has updated the order (${orderData._id}). The Rider has cancelled the order`, {}, `Order Cancelled ${moment(new Date()).format('Do DDD, YYYY HH:mm:ss ')}`).then(sent => console.log('notification sent', sent));
        }

        res.send({success: true, message: 'Trip successfully ended!', data: null});
  
    } catch (error) {
        console.log(`Error ending trip: ${error.message}`, error);
        logger.error(error.message, error);
    }

});



module.exports = router;