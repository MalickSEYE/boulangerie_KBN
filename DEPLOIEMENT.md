# 🚀 Déploiement sur Vercel — Guide complet

## Vue d'ensemble

```
Vercel
├── Frontend React  →  https://votre-boulangerie.vercel.app
└── API Serverless  →  https://votre-boulangerie.vercel.app/api/...
                                   ↕
                           MongoDB Atlas (cloud gratuit)
```

---

## Étape 1 — Créer la base de données MongoDB Atlas (gratuit)

1. Allez sur **https://cloud.mongodb.com** → Créer un compte gratuit
2. Créer un **cluster gratuit** (M0 Shared, 512 MB — suffisant pour une boulangerie)
3. **Database Access** → Add New User :
   - Username : `boulangerie`
   - Password : générez un mot de passe fort, **notez-le**
   - Rôle : `Read and write to any database`
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
   ⚠️ Nécessaire car Vercel utilise des IPs dynamiques
5. **Connect** → Drivers → copiez l'URI :
   ```
   mongodb+srv://boulangerie:<password>@cluster0.xxxxx.mongodb.net/boulangerie?retryWrites=true&w=majority
   ```
   Remplacez `<password>` par votre mot de passe

---

## Étape 2 — Préparer le code sur GitHub

1. Créez un compte sur **https://github.com** (si pas encore fait)
2. Créez un **nouveau dépôt** (repository) public ou privé
3. Uploadez le contenu du dossier `boulangerie_vercel/` (pas le dossier lui-même, son contenu)

Via terminal :
```bash
cd boulangerie_vercel
git init
git add .
git commit -m "Initial commit - Boulangerie"
git remote add origin https://github.com/VOTRE_NOM/boulangerie.git
git push -u origin main
```

---

## Étape 3 — Déployer sur Vercel

1. Allez sur **https://vercel.com** → Créer un compte (avec votre compte GitHub)
2. Cliquez **"Add New Project"**
3. **Import** votre dépôt GitHub `boulangerie`
4. Vercel détecte automatiquement Vite/React — **ne changez rien** aux paramètres de build
5. Section **"Environment Variables"** — ajoutez ces 3 variables :

   | Nom              | Valeur                                          |
   |------------------|-------------------------------------------------|
   | `MONGODB_URI`    | `mongodb+srv://boulangerie:...@cluster0.xxx...` |
   | `JWT_SECRET`     | une clé longue et aléatoire (min. 32 chars)     |
   | `JWT_EXPIRES_IN` | `8h`                                            |

6. Cliquez **"Deploy"** → attendez 1-2 minutes

✅ Votre app est en ligne sur `https://boulangerie-xxx.vercel.app`

---

## Étape 4 — Créer le premier compte admin

L'API est en ligne mais la base est vide. Créez le premier admin avec curl ou Postman :

```bash
curl -X POST https://VOTRE-APP.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_BOOTSTRAP_TOKEN" \
  -d '{
    "nom": "Admin Boulangerie",
    "email": "admin@boulangerie.sn",
    "password": "motdepasse123",
    "role": "admin"
  }'
```

> ⚠️ Pour le tout premier utilisateur, créez-le directement via MongoDB Atlas :
> Clusters → Browse Collections → boulangerie → users → Insert Document

Exemple de document à insérer (le mot de passe `admin123` hashé avec bcrypt 12 rounds) :
```json
{
  "nom": "Admin",
  "email": "admin@boulangerie.sn",
  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HSbRuKm",
  "role": "admin",
  "actif": true,
  "createdAt": { "$date": "2024-01-01T00:00:00Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00Z" }
}
```
(Ce hash correspond au mot de passe `admin123` — changez-le après connexion)

---

## Développement local

```bash
npm install
npm run dev        # Frontend sur http://localhost:5173
```

Pour tester l'API en local, installez Vercel CLI :
```bash
npm i -g vercel
vercel dev         # Lance frontend + fonctions serverless ensemble
```

Créez un fichier `.env.local` à la racine :
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=ma_cle_secrete_locale
JWT_EXPIRES_IN=8h
```

---

## Mises à jour

Chaque `git push` sur la branche `main` redéploie automatiquement sur Vercel.

```bash
git add .
git commit -m "Ajout d'une fonctionnalité"
git push
# → Vercel redéploie en ~1 minute
```

---

## Structure finale déployée

```
/                          ← React (Vite build → dist/)
/api/auth/login.js         ← POST /api/auth/login
/api/auth/register.js      ← POST /api/auth/register
/api/auth/me.js            ← GET  /api/auth/me
/api/produits/index.js     ← GET + POST /api/produits
/api/produits/[id].js      ← GET + PUT + DELETE /api/produits/:id
/api/ventes/index.js       ← GET + POST /api/ventes
/api/ventes/stats/jour.js  ← GET  /api/ventes/stats/jour
/api/users/index.js        ← GET  /api/users
/api/users/[id]/role.js    ← PUT  /api/users/:id/role
/api/users/[id]/actif.js   ← PUT  /api/users/:id/actif
```
