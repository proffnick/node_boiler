// routes and other middlewares
const express   = require('express');
const errors    = require('../middleware/error');
const users     = require('../routes/users');
const constants = require('../routes/constants');
const settings  = require('../routes/settings');
const auth      = require('../routes/auth');
const imageKit  = require('../routes/kitAuth');
const mailer    = require('../routes/mails');
const wallets   = require('../routes/wallets');
const notifications   = require('../routes/notifications');
const pns       = require('../routes/pns');
const orders    = require('../routes/orders');
const banks     = require('../routes/banks');
const transfers = require('../routes/transfers');
const transfer  = require('../routes/transfer');
const approveDelivery = require('../routes/approveDelivery');

module.exports = function(app){ 
        // accept json request
        app.use(express.json());
        // set static
        app.use('/api/users', users);
        app.use('/api/notifications', notifications);
        app.use('/api/orders', orders);
        app.use('/api/constants', constants);
        app.use('/api/wallets', wallets);
        app.use('/api/settings', settings);
        app.use('/api/pns', pns);
        app.use('/api/banks', banks);
        app.use('/api/transfers', transfers);
        app.use('/api/transfer', transfer);
        app.use('/api/approve-delivery', approveDelivery);
        app.use('/api/kitauth', imageKit);
        app.use('/api/mails', mailer); 
        app.use('/api/auth', auth);
        app.use(errors);
}