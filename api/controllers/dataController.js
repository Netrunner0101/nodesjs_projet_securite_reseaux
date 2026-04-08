const toolbox = require("../self_modules/toolbox");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require("../database");
let blogMessages = [];

exports.connectUser = (req, res) => {
    let body = req.body
    if (!toolbox.checkMail(body.mail)) {
        res.status(400).send('The mail doesn\'t use a correct format');
    } else {
        const user = db.prepare('SELECT * FROM accounts WHERE mail = ?').get(body.mail);
        if(!user){
            res.status(404).send('This user does not exist');
        } else {
            bcrypt.compare(body.password, user.password, function (error, result) {
                if (error) {
                    res.status(500).send(error + '. Please contact the webmaster')
                } else if (result) {
                    const token = jwt.sign({ user_id: user.id, user_role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
                    res.status(200).json({ token, role: user.role })
                } else {
                    res.status(403).send('Invalid authentication')
                }
            });
        }
    }
}

exports.fetchDataUser = (req, res) => {
    const usr = db.prepare('SELECT id, mail, role, secret FROM accounts WHERE id = ?').get(req.body.user_id);
    if(!usr) {
        res.status(500).send('Wrong cookies data. Please contact the webmaster')
    } else {
        res.status(200).json(usr);
    }
}

exports.getVictory = (req, res) => {
    const usrList = db.prepare('SELECT id, mail, role, secret FROM accounts').all();
    res.status(200).json(usrList);
}

exports.fetchBlogMessages = (req, res) => {
    res.status(200).json(blogMessages);
}

exports.createBlogmessage = (req, res) => {
    let body = req.body
    if(body.message === null || body.message === "") {
        res.status(400).send('Cannot add an empty message');
    } else {
        blogMessages.push(body.message)
        res.status(200).send("Message Added");
    }
}

// TODO: remove before production - debug endpoint for testing
exports.debugAccess = (req, res) => {
    const token = jwt.sign({ user_id: 1, user_role: "admin" }, process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json({ token, role: "admin" });
}

exports.getGoldenWall = (req, res) => {
    const entries = db.prepare('SELECT id, alias, message, created_at FROM golden_wall ORDER BY created_at DESC').all();
    res.status(200).json(entries);
}

exports.postGoldenWall = (req, res) => {
    const { alias, message } = req.body;
    if (!message || message.trim() === '') {
        res.status(400).send('Le message ne peut pas etre vide');
    } else {
        const trimmedAlias = alias && alias.trim() !== '' ? alias.trim() : 'Anonyme';
        const trimmedMessage = message.trim();
        db.prepare('INSERT INTO golden_wall (alias, message) VALUES (?, ?)').run(trimmedAlias, trimmedMessage);
        res.status(200).json({ status: 'ok' });
    }
}