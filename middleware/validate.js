
module.exports = (validator) => {
    return (req, res, next) => {
        const {error} = validator(req.body);
        if(error) res.status(404).send(error.details[0].message);
        next();
    }
}