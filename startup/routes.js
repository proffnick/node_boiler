// routes and other middlewares
const express = require('express');
const errors = require('../middleware/error');
const users = require('../routes/users');
const listings = require('../routes/listings');
const auth = require('../routes/auth');

module.exports = function(app){ 
        // accept json request
        app.use(express.json());
        app.use('/api/users', users);
        app.use('/api/listings', listings);
        app.use('/api/auth', auth);
        app.use(errors);
}