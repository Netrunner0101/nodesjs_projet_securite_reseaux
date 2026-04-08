const jwt = require('jsonwebtoken');

module.exports = (req, res, callback) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ error: 'Token manquant', message: 'Veuillez vous connecter.' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expiré', message: 'Votre session a expiré. Veuillez vous reconnecter.' });
            }
            return res.status(401).json({ error: 'Token invalide', message: 'Authentification échouée.' });
        }
        req.body.user_id = payload.user_id;
        req.body.user_role = payload.user_role;
        callback();
    });
}