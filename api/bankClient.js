const { create }  =  require("apisauce");
const config      = require('config');


const apiClientBank = create({
    baseURL: config.get('paystackBaseUrl')
});

apiClientBank.addAsyncRequestTransform(async (request) => {
    const authToken = config.get('paystackPrivateKey');
    if(!authToken) return;
    request.headers["Authorization"] = `Bearer ${authToken}`;
    request.headers["Content-Type"] = "application/json";
} );


module.exports =  {
    apiClientBank
}