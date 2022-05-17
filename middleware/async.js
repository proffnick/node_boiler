module.exports = function(handler){
    return async (req, res, next) => {
        try{
            await handler(req, res);
        }catch(Err){
            // log error in a file
            next(Err);
        }
    }
}