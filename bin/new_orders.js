const cron                  = require('node-cron');
const { sendMail, sendSMS, shuffleArray } = require('./helpers');
const logger                = require('../middleware/winston');
const { apiClient }         = require('../api/client');
const pushNotification      = require('../utilities/pushNotifications');
const moment                = require('moment');

// endpoints
const usersEndPoint         = 'users';
const ordersEndPoint        = 'orders';
const notesEndPoint         = 'notifications';

cron.schedule('5 * * * * *', async function() {
    /*
        *# ┌────────────── second (optional)
        *# │ ┌──────────── minute
        *# │ │ ┌────────── hour
        *# │ │ │ ┌──────── day of month
        *# │ │ │ │ ┌────── month
        *# │ │ │ │ │ ┌──── day of week
        *# │ │ │ │ │ │
        *# │ │ │ │ │ │
        *# * * * * * *
    */
    // go ahead and do the needful here
    //sendMail('proffnick1@gmail.com', 'testing the cron job general', 'If you can, we certainly can').then(sent => console.log(sent, 'sent ?')).catch(error => console.log(error, 'erorr ?'));
    
    /* 
        A. Check orders, where status is false and look for
        1. The requester
        2. The riders within the region of the requester
        3. Submit to both the admin and the riders
        4. Update requester {email, notification and call the app }
        5. Change the status to pending 
    */
   //console.log("Ran steadily", ordersEndPoint, ' and end-point');
    try {
        apiClient.get(ordersEndPoint+`/new_orders`).then( (results) => {
            if(results.ok){
                const DATA = results.data;
                if(Array.isArray(DATA)){
                    //console.log("Did we get here ?");
                 DATA.forEach(async  order => {

                    const userId = order.customer;
                    // look for the customer
                    const customer = (await apiClient.get(usersEndPoint+`/${userId}`)).data;

                    //console.log(customer, 'the customer');
                    // to add subregion
                        // find all riders with similar region as this customer
                        // this consition provides that the user must be a rider
                        // he must have been online at least 5 minutes ago
                        // and must be from within same region or subregion as the suctomer
                        // additional condition is that as long as it is admin, it does not ahve to be within same region
                    const active = encodeURIComponent(JSON.stringify({$or: [{$and: [{userType: 'rider'},{isAdmin: true}]},{$and:[{userType: 'rider'},{approved: true},{hasPendingRequest: false},{lastSeen: {$gte: new Date((new Date()).getTime() - (1000 * 60 * 5))}},{$or: [{subRegion: customer?.subRegion},{region: customer?.region }]}]}]})); 

                    //console.log(active, 'the conditional');
                    // look for the riders
                    apiClient.get(usersEndPoint+`/active/riders?active=${active}`).then((riders) => {
                        
                        //console.log(riders.data, 'list of found riders');
                        
                        if(Array.isArray(riders.data)){
                            let ridersList = riders.data;
                            const totalRiders = ridersList.length;
                            
                            // shuffle it to make it more random
                            if(totalRiders > 2){
                                ridersList = shuffleArray(ridersList);
                            }

                            ridersList.forEach(async rider => {
                                
                                //console.log(rider);
                                // dealing with 
                                // rider immediate
                                // customer // requester
                                // order  // the order from teh customer

                                // make sure riser has no pending delivery
                                const search    = encodeURIComponent(JSON.stringify({$and: [{rider: rider._id}, {state: 'intransit'}]}));

                                const pending = await apiClient.get(ordersEndPoint+`?qr=${search}`);

                                const isBusy = (pending.ok && (pending?.data) && (pending?.data?._id)) ? true: false;

                                if(!isBusy){
                                    // send message
                                        //only to admin
                                    const message = `New pickup request from ${customer?.firstName} with order Id: ${order?._id}, ITEM(S): ${order.item}, FROM: ${order?.pickup?.address}, TO: ${order?.deliver?.address}, Phone: ${customer?.phoneNumber}`;

                                        if(rider.isAdmin){
                                            sendSMS(rider.phoneNumber, message).then((sent) => {
                                                console.log("sms sent", sent);
                                            }).catch((error) => {
                                                console.log(error, 'failed to sned sms');
                                            });
                                        }
                                    
                                    
                                        // send notification
                                    const pushNotificationId = (rider?.pushNotificationToken) ? [rider?.pushNotificationToken]: null;
                                    const notoficationMessage = `New pickup request from ${customer?.firstName} with order Id: ${order?._id}, ITEM(S): ${order.item}, FROM: ${order?.pickup?.address}, TO: ${order?.deliver?.address}`;

                                    const dataObject = {type: "ORDER", totalRiders: totalRiders, details: JSON.stringify(order)};

                                    if(pushNotificationId){ 
                                        pushNotification(pushNotificationId,notoficationMessage, dataObject, `New Order ${moment(new Date(order.date)).fromNow()}`).then(sent => console.log('notification sent', sent));
                                    }
                                    // send the app notification 
                                    // construct the order details
                                    const orderDetails = JSON.stringify({
                                        goto: "RequestDetails",
                                        order: order
                                    });
                                    // updated note
                                    apiClient.post(notesEndPoint, {
                                        _type: "ORDER", 
                                        _amount: 0, 
                                        _note: notoficationMessage, 
                                        _action: orderDetails, 
                                        _userid: rider._id
                                    });
                                    // send email
                                    //sendMail(rider.email, `New order ${moment(new Date(order.date)).fromNow()}`, message).then(sent => console.log("email message sent", sent));
                                    // update order
                                    apiClient.put(ordersEndPoint+`/${order._id}`, {state: 'pending'}).then(sent => console.log("order updated", sent.ok)).catch(error => console.log('error updating order', error));
                                    // update the user
                                    // hasPendingRequest: true
                                     // update order
                                     apiClient.put(usersEndPoint+`/${rider._id}`, {hasPendingRequest: true}).then(sent => console.log("rider updated", sent.ok)).catch(error => console.log('error updating rider', error));
                                }

                            });
                        }
                        

                    }).catch((error) => {
                        logger.error(error.message, error);
                    });

                    // deliveries table // data, order id, amount,  
                    // last seen
                    // online
                    // new Date( moment().add(loan.loan_tenor, 'days').format("YYYY-MM-DD") ).toISOString()
                    // console.log(order, 'the desired order');
                 });    
                }
            }

            if(!results.ok){
                //console.log(results.data);
            }
        });
    } catch (error) {
        console.log(error.message, error);
        logger.error(error.message, error); 
    }

    

});