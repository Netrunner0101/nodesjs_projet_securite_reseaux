const jwt = require('jsonwebtoken');

module.exports = (req, res, callback) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).send('Token missing. Please provide a valid token.');
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            res.status(401).send(error + '. Please contact the webmaster')
        } else {
            req.body.user_id = payload.user_id
            req.body.user_role = payload.user_role
            callback();
        }
    });
}