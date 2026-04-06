const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mail TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    secret TEXT
  )
`);

const count = db.prepare('SELECT COUNT(*) AS cnt FROM accounts').get();
if (count.cnt === 0) {
  const insert = db.prepare(
    'INSERT INTO accounts (mail, password, role, secret) VALUES (?, ?, ?, ?)'
  );
  const seed = db.transaction((users) => {
    for (const u of users) insert.run(u.mail, u.password, u.role, u.secret);
  });
  seed([
    { mail: 'admin@admin.com',  password: bcrypt.hashSync('admin', 12),  role: 'admin', secret: "Je sais où se situe la chouette d'or !" },
    { mail: 'admin2@admin.com', password: bcrypt.hashSync('admin2', 12), role: 'admin', secret: 'Le deuxième admin connaît tous les secrets.' },
    { mail: 'user1@gmail.com',  password: bcrypt.hashSync('user1', 12),  role: 'user',  secret: "Si tu vois un oiseau blanc sur un lac, c'est un signe !" },
    { mail: 'user2@gmail.com',  password: bcrypt.hashSync('user2', 12),  role: 'user',  secret: 'Le caractère autotélique et systémique du capitalisme ne doit pas être absolutisé !' },
  ]);
}

module.exports = db;
