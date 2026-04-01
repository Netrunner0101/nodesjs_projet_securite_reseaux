# Exercice 4 - Backdoor oubliee avant la MEP

## Contexte

En tant que developpeur, une backdoor a ete ajoutee pour faciliter les tests avant la mise en production (MEP). Cette backdoor a ete "oubliee" et est toujours presente dans le code.

---

## 1. La Backdoor - Comment la trouver

### Ou chercher

La backdoor se trouve dans les **routes publiques** de l'API (pas besoin d'authentification).

**Fichiers concernes :**

- `api/self_modules/routes/routes.js` - Declaration de la route
- `api/controllers/dataController.js` - Logique du endpoint

### Comment la reperer

1. Ouvrir le fichier `api/self_modules/routes/routes.js`
2. Observer la route `GET /debug-login` qui est accessible **sans authentification**
3. Ouvrir `api/controllers/dataController.js` et chercher la fonction `debugAccess` (en bas du fichier)

### Ce que fait la backdoor

- **Endpoint :** `GET /debug-login`
- **Effet :** Retourne un **token JWT admin valide** sans demander de mot de passe
- **Risque :** N'importe qui peut acceder a `http://localhost:3001/debug-login` et obtenir un acces administrateur complet

### Comment l'exploiter (pour le test)

```bash
# 1. Appeler la backdoor
curl http://localhost:3001/debug-login

# 2. Reponse : un token admin valide
# {"token":"eyJhbGciOiJIUzI1NiIs...","role":"admin"}

# 3. Utiliser ce token pour acceder aux donnees admin
curl -H "token: <le_token_recu>" http://localhost:3001/admin
```

### Indices pour trouver la backdoor

- Chercher les commentaires contenant `TODO` ou `debug` dans le code
- Regarder les routes publiques (fichier `routes.js`) - une route suspecte s'y trouve
- Comparer les routes publiques vs securisees : pourquoi un endpoint de login est-il dans les routes publiques ?

```bash
# Commande pour chercher des indices dans le code
grep -r "TODO" api/
grep -r "debug" api/
```

---

## 2. Fonctionnalite de Logout (ajoutee egalement)

### Ce qui a ete ajoute

Un bouton **"Se deconnecter"** a ete ajoute sur toutes les pages authentifiees :

| Page | Fichier |
|------|---------|
| Dashboard utilisateur | `40bierges/src/views/Index.js` |
| Dashboard admin | `40bierges/src/views/admin/admin.jsx` |
| Blog | `40bierges/src/views/blog/blog.jsx` |

### Comment ca marche

1. La fonction `deleteCookie("Token")` est ajoutee dans `40bierges/src/toolBox.js`
2. Elle supprime le cookie `Token` en mettant sa date d'expiration dans le passe
3. Apres suppression du cookie, l'utilisateur est redirige vers `/login`

### Fichiers modifies

- `40bierges/src/toolBox.js` - Nouvelle fonction `deleteCookie()`
- `40bierges/src/views/Index.js` - Bouton logout + handler
- `40bierges/src/views/admin/admin.jsx` - Bouton logout + handler
- `40bierges/src/views/blog/blog.jsx` - Bouton logout + handler + correction redirect vers `/login`

---

## Resume des fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `api/controllers/dataController.js` | Ajout fonction `debugAccess` (backdoor) |
| `api/self_modules/routes/routes.js` | Ajout route `GET /debug-login` (backdoor) |
| `40bierges/src/toolBox.js` | Ajout fonction `deleteCookie()` |
| `40bierges/src/views/Index.js` | Ajout bouton "Se deconnecter" |
| `40bierges/src/views/admin/admin.jsx` | Ajout bouton "Se deconnecter" |
| `40bierges/src/views/blog/blog.jsx` | Ajout bouton "Se deconnecter" + fix redirect |
