# Mongolingo — Design Spec
**Date:** 2026-03-18
**Projet:** R403 NoSQL — DUT Info Vannes
**Contexte:** Application web solo à rendre en fin de ressource

---

## Objectif

Construire **Mongolingo**, une application web React de type quiz (inspiré Duolingo) pour apprendre les requêtes MongoDB. L'univers de données est celui de **Cyberespar**, entreprise bretonne spécialisée en IoT maritime et applications mobiles.

---

## Architecture

### Approche retenue : Monorepo avec `concurrently`

Un seul `npm install && npm start` à la racine lance les deux processus simultanément.

```
mongolingo/
├── package.json          ← scripts: start (concurrently), install:all
├── readme.txt
├── client/               ← React + Vite (port 5173 en dev)
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Quiz/
│       │   ├── Collections/
│       │   └── DataManager/
│       ├── pages/
│       └── hooks/
├── server/               ← Express.js (port 3001)
│   ├── index.js
│   ├── routes/
│   │   ├── quiz.js
│   │   ├── collections.js
│   │   └── data.js
│   └── db/
│       └── connection.js
├── schemas/              ← JSON Schema des collections (livrable)
├── data/                 ← Données de démonstration JSON (livrable)
└── backup/               ← Dossier de sauvegarde (livrable)
```

**Flux :** React ↔ REST API `/api/*` ↔ Express ↔ MongoDB (`localhost:27017`, db `mongolingo`)

En production, Express sert le build Vite (`client/dist/`).

---

## Collections MongoDB — Univers Cyberespar

### `clients`
Entreprises clientes de Cyberespar.
```json
{
  "nom": "Mer Agitée",
  "secteur": "course à la voile",
  "ville": "Lorient",
  "siret": "12345678900012",
  "contact": { "nom": "Jean Dupont", "email": "j.dupont@meragitee.com", "tel": "0612345678" }
}
```

### `projets`
Projets réalisés avec technologies, budget, durée, statut.
```json
{
  "titre": "TrimControl",
  "client_id": ObjectId,
  "technologies": ["React-Native", "MongoDB", "Node.js"],
  "budget": 12000,
  "debut": ISODate,
  "fin": ISODate,
  "statut": "terminé",
  "description": "Application mobile de trimming pour voilier de course"
}
```

### `employes`
Équipe Cyberespar avec compétences, rôles et projets assignés.
```json
{
  "nom": "Goulven Kerbellec",
  "role": "fondateur",
  "competences": ["React", "React-Native", "MongoDB", "C++", "Java"],
  "projets": [ObjectId, ObjectId],
  "salaire": 4500,
  "embauche": ISODate
}
```

### `appareils_iot`
Capteurs maritimes connectés (voiliers, drones marins).
```json
{
  "id_appareil": "CAPT-001",
  "type": "capteur_vent",
  "bateau": "Mer Agitée IV",
  "config": { "frequence_hz": 10, "seuil_alerte": 40 },
  "localisation": { "lat": 47.65, "lng": -2.76 },
  "actif": true
}
```

### `mesures_iot`
Série temporelle de relevés capteurs.
```json
{
  "appareil_id": "CAPT-001",
  "timestamp": ISODate,
  "type": "vitesse_vent",
  "valeur": 32.5,
  "unite": "noeuds",
  "alerte": false
}
```

### `formations` — non implémentée, exclue des livrables `schemas/` et `data/`
Formations tech dispensées par Cyberespar.
```json
{
  "titre": "Introduction à MongoDB",
  "technologie": "MongoDB",
  "date": ISODate,
  "participants": [{ "nom": "Alice Martin", "note": 17, "certifie": true }]
}
```

---

## Style visuel

**Dark mode sobre, style outil de développement professionnel** (référence : Linear, Vercel).

- Palette : zinc (`#09090b` fond, `#18181b` surface, `#27272a` bordures)
- Texte : `#e4e4e7` principal, `#a1a1aa` secondaire, `#52525b` tertiaire
- Accent unique : violet `#818cf8`
- Code : vert `#4ade80`, bleu `#60a5fa`, orange `#f59e0b`
- Typographie : sans-serif pour l'UI, monospace pour le code
- Zéro emoji, zéro card générique AI
- Layout : topbar horizontale avec indicateur de connexion MongoDB

---

## Système de Quiz

### 3 modes selon le niveau
| Mode | Niveaux | Description |
|------|---------|-------------|
| QCM | 1-2 | Choisir la bonne requête parmi 3-4 options |
| Remplissage de blancs | 2-3 | Compléter la requête avec les bons mots/valeurs |
| Saisie libre | 3-5 | Taper et exécuter sa propre requête sur la vraie base |

### Progression
- Sauvegardée dans **localStorage** (pas de compte utilisateur)
- Barre de progression en bas de page (X/30 réussis)
- Historique des réponses par niveau consultable en page Progression

### Exécution sécurisée des requêtes
Les requêtes saisies librement sont parsées côté serveur via une **whitelist d'opérations autorisées**. Approche :
1. Le serveur parse la chaîne soumise pour en extraire la méthode MongoDB appelée (`find`, `aggregate`, `countDocuments`, `updateOne`, `deleteMany`, `createIndex`, etc.)
2. Si la méthode n'est pas dans la whitelist → rejet avec message d'erreur explicite
3. La requête est exécutée via le driver MongoDB officiel (mongoose / mongodb) — jamais via `eval`
4. Timeout 3 secondes côté serveur

Méthodes autorisées : `find`, `findOne`, `aggregate`, `countDocuments`, `distinct`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`, `insertOne`, `insertMany`, `createIndex`, `explain`

Méthodes refusées (non listées) : `drop`, `dropDatabase`, `dropCollection`, et toute autre opération non explicitement autorisée.

> Note : l'app est conçue comme outil local de développement/apprentissage sur localhost.

---

## Les 30 Requêtes

### Niveau 1 — Lecture basique (6 questions)
| # | Mode | Énoncé | Commande clé |
|---|------|--------|-------------|
| 01 | QCM | Retourner tous les clients | `db.clients.find({})` |
| 02 | QCM | Trouver un client par nom exact | `findOne({ nom: "..." })` |
| 03 | Blancs | Projection nom + secteur uniquement | `find({}, { nom:1, secteur:1, _id:0 })` |
| 04 | QCM | Compter le nombre d'appareils IoT | `countDocuments()` |
| 05 | Blancs | Trier projets par date desc | `sort({ debut: -1 })` |
| 06 | QCM | 3 mesures IoT les plus récentes | `sort({ timestamp:-1 }).limit(3)` |

### Niveau 2 — Filtres & opérateurs (8 questions)
| # | Mode | Énoncé | Commande clé |
|---|------|--------|-------------|
| 07 | Blancs | Projets budget > 5000€ | `{ budget: { $gt: 5000 } }` |
| 08 | QCM | Appareils type capteur_vent ou capteur_temp | `{ type: { $in: [...] } }` |
| 09 | Blancs | Mesures alerte=true ET valeur > 50 | `{ alerte:true, valeur:{ $gt:50 } }` |
| 10 | QCM | Employés avec compétence "React" | `{ competences: "React" }` |
| 11 | Blancs | Projets utilisant React ET MongoDB | `{ technologies: { $all: [...] } }` |
| 12 | QCM | Clients dont le siret existe | `{ siret: { $exists: true } }` |
| 13 | Blancs | Appareils avec latitude > 47.5 | `{ "localisation.lat": { $gt: 47.5 } }` |
| 13b | QCM | Projets dont la description contient "maritime" (pattern) | `{ description: { $regex: /maritime/i } }` |

### Niveau 3 — Modifications & index (6 questions)
| # | Mode | Énoncé | Commande clé |
|---|------|--------|-------------|
| 14 | Blancs | Mettre à jour le statut d'un projet | `updateOne + $set` |
| 15 | QCM | Ajouter compétence sans dupliquer | `$addToSet` |
| 16 | Libre | Supprimer mesures alerte=false et valeur < 5 | `deleteMany` |
| 17 | Blancs | Incrémenter budget d'un projet de 1000 | `$inc` |
| 18 | Libre | Créer un index sur le champ "type" | `createIndex({ type: 1 })` |
| 19 | Libre | Upsert client | `updateOne + { upsert: true }` |

### Niveau 4 — Agrégation (7 questions)
| # | Mode | Énoncé | Commande clé |
|---|------|--------|-------------|
| 20 | Blancs | Nombre de projets par statut | `$group + $sum:1` |
| 21 | Blancs | Budget moyen par client | `$group + $avg:"$budget"` |
| 22 | Libre | Jointure projets → clients | `$lookup` |
| 23 | Libre | Dérouler technologies + compter | `$unwind + $group` |
| 24 | Libre | Moyenne mesures par appareil (24h) | `$match + $group + $avg` |
| 25 | Libre | Top 3 employés avec le plus de projets | `$project size + $sort + $limit` |
| 26 | Libre | Répartir budgets en tranches | `$bucket` |

### Niveau 5 — Pipelines complexes (4 questions)
| # | Mode | Énoncé | Commande clé |
|---|------|--------|-------------|
| 27 | Libre | Pipeline mesures alertes → appareils → projets | `$match → $lookup → $lookup → $project` |
| 28 | Libre | Rapport multi-facettes en une requête | `$facet` |
| 29 | Libre | Pipeline : filtrer les projets maritimes puis joindre les mesures d'alerte | `$match → $lookup mesures_iot → $unwind → $group` |
| 30 | Libre | Analyse d'une requête lente | `.explain("executionStats")` |

---

## Routes API Express

### `GET /api/quiz` — liste tous les quiz (id, niveau, mode, énoncé)
### `GET /api/quiz/:id` — quiz complet avec solution et explication

Structure de l'objet quiz retourné :
```json
{
  "id": 22,
  "niveau": 4,
  "mode": "libre",
  "enonce": "Jointure projets → clients : afficher chaque projet avec le nom du client",
  "hint": "Utilise $lookup avec localField: 'client_id'",
  "solution": {
    "query": "db.projets.aggregate([{ $lookup: { from: 'clients', localField: 'client_id', foreignField: '_id', as: 'client' } }])",
    "explanation": "$lookup effectue une jointure entre deux collections. localField est le champ dans la collection source, foreignField est le champ correspondant dans la collection cible.",
    "expected_output_sample": [{ "titre": "TrimControl", "client": [{ "nom": "Mer Agitée" }] }],
    "auto_execute_on_reveal": true
  }
}
```
Quand l'utilisateur révèle la solution, `solution.query` est automatiquement exécutée sur la base et le résultat réel est affiché avec l'explication.
### `POST /api/quiz/:id/run` — exécute `body.query` sur MongoDB
### `GET /api/quiz/:id/hint` — retourne l'indice

### `GET /api/collections` — liste avec stats (count, taille)
### `GET /api/collections/:name/schema` — schéma JSON + descriptions

Les fichiers `schemas/<collection>.json` suivent le format JSON Schema (draft-07). Structure minimale :
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "appareils_iot",
  "description": "Capteurs maritimes connectés utilisés par les clients Cyberespar",
  "type": "object",
  "required": ["id_appareil", "type", "bateau", "actif"],
  "properties": {
    "id_appareil": { "type": "string", "description": "Identifiant unique de l'appareil" },
    "type": { "type": "string", "enum": ["capteur_vent", "capteur_temp", "capteur_cap", "gps"], "description": "Type de capteur" },
    "bateau": { "type": "string", "description": "Nom du bateau équipé" },
    "config": {
      "type": "object",
      "properties": {
        "frequence_hz": { "type": "number", "description": "Fréquence d'échantillonnage en Hz" },
        "seuil_alerte": { "type": "number", "description": "Valeur déclenchant une alerte" }
      }
    },
    "localisation": {
      "type": "object",
      "properties": {
        "lat": { "type": "number" },
        "lng": { "type": "number" }
      }
    },
    "actif": { "type": "boolean", "description": "Appareil en service" }
  }
}
```
### `GET /api/collections/:name/sample` — 3 documents d'exemple

### `POST /api/data/load` — charge `data/*.json` dans MongoDB
### `GET /api/data/export/json` — export JSON zippé
### `GET /api/data/export/bson` — export BSON via mongodump
### `POST /api/data/backup` — sauvegarde horodatée dans `backup/`
### `POST /api/data/restore` — restaure depuis `backup/`

### `GET /api/health` — statut connexion MongoDB

---

## Pages React

| Page | Route | Rôle |
|------|-------|------|
| Quiz | `/` | Sélection niveau + quiz interactif |
| Collections | `/collections` | Documentation schémas Cyberespar |
| Données | `/data` | Import / Export / Backup |
| Progression | `/progress` | Stats localStorage |

---

## Volume des données de démonstration

Volume minimum pour que les agrégations de niveaux 4-5 produisent des résultats significatifs :

| Collection | Documents min |
|------------|--------------|
| `clients` | 10 |
| `projets` | 20 |
| `employes` | 8 |
| `appareils_iot` | 12 |
| `mesures_iot` | 60+ (série temporelle) |

---

## Livrables (dossier compressé)

- `mongolingo/` — code source sans `node_modules`
- `readme.txt` — installation Ubuntu + lien vidéo démo (2 min max)
  - Prérequis : Node.js, MongoDB, `mongodb-database-tools` (fournit `mongodump`/`mongorestore`)
- `schemas/` — JSON Schema de chaque collection
- `data/` — fichiers JSON de démonstration
- `backup/` — dossier de sauvegarde initial

---

## Critères de notation couverts

| Critère | Couverture |
|---------|-----------|
| Construction des collections | 5 collections liées, données réalistes Cyberespar |
| Schémas | JSON Schema dans `schemas/`, documentés champ par champ |
| Commentaires/explications | Explication après chaque quiz + page Collections |
| Requêtes (30) | Progression niveau 1→5, tous les opérateurs importants couverts |
| Gestion de l'exécution | Whitelist d'opérations autorisées, driver natif MongoDB, timeout 3s |
| Système de sauvegarde | JSON + BSON export, backup horodaté, restore |
| Fonctionnement React | Vite + hooks + composants séparés |
| Facilité d'installation | `npm start` unique, readme Ubuntu |
| Soin apporté | Design sobre pro, pas générique AI |
| Démonstration vidéo | À réaliser (2 min max) |
