const auth      = require('../middleware/auth');
const cors      = require('cors');
// require express
const express   = require('express');
const router    = express.Router();
                router.all('*', cors());
const pushNotification = require('../utilities/pushNotifications');

router.post('/', auth, async (req, res) => {
    if(!req.body.message || !req.body.title || !req.body.token || !req.body.data){
        res.status(404).send({error: true, message: "Invalud request!"});
    }

    //console.log(req.body, 'the request body');
    const done = await pushNotification([req.body.token], req.body.message, req.body.data, req.body.title);
    res.send(done);
});



module.exports = router;