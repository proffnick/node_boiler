const jwt = require('jsonwebtoken');
const config = require('config');

const  extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }else if(req.header('x-auth-token')){
        return req.header('x-auth-token');
    }
    return null;
}
module.exports = function (req, res, next){
    const token = extractToken(req);
    if(!token) return  res.status(401).send('Access denied! No token provided');

    try{
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();
    }catch(Ex){
        res.status(400).send('Invalid Token');
   }

}