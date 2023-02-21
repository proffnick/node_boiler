const config        = require('config');
const express       = require('express');
const router        = express.Router();
const ImageKit      = require('imagekit');

const imagekit = new ImageKit({
    urlEndpoint: config.get('kitEndPoint'),
    publicKey: config.get('kitPublic'),
    privateKey: config.get('kitPrivate')
  });


  router.get('/', function (req, res) {
    var result = imagekit.getAuthenticationParameters();
    res.send(result);
  });

  module.exports = router;