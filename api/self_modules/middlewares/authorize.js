const jwt = require('jsonwebtoken');

module.exports = (req, res, callback) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ error: 'Token manquant. Veuillez vous connecter.' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            res.status(401).json({ error: 'Token invalide ou expire. Veuillez vous reconnecter.' });
        } else {
            req.body.user_id = payload.user_id
            req.body.user_role = payload.user_role
            callback();
        }
    });
}
