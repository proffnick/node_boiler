const { create }  =  require("apisauce");
const config      = require('config');


const apiClient = create({
    baseURL: config.get('baseUrl')
});

apiClient.addAsyncRequestTransform(async (request) => {
    const authToken = config.get('auth');
    if(!authToken) return;
    request.headers["x-auth-token"] = authToken;
    request.headers["Content-Type"] = "application/json";
    request.headers["Content-Type"] = "application/json";
} );


module.exports =  {
    apiClient
}