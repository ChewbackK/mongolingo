# Mongolingo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Mongolingo, a React quiz app for learning MongoDB queries, themed around the Cyberespar universe (Breton maritime IoT company).

**Architecture:** Monorepo with `concurrently` — React+Vite client (port 5173) talks to Express API (port 3001) backed by MongoDB (localhost:27017, db `mongolingo`). No ORM — native `mongodb` driver to stay close to shell syntax students are learning.

**Tech Stack:** React 18, Vite, React Router v6, Express, mongodb (native driver), concurrently, archiver (zip export)

**Spec:** `docs/superpowers/specs/2026-03-18-mongolingo-design.md`

---

## File Structure

```
mongolingo/
├── package.json
├── readme.txt
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── hooks/
│       │   └── useProgress.js
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Topbar.jsx
│       │   └── Quiz/
│       │       ├── LevelSelect.jsx
│       │       ├── QuizRunner.jsx
│       │       ├── QCM.jsx
│       │       ├── FillBlanks.jsx
│       │       └── FreeInput.jsx
│       └── pages/
│           ├── QuizPage.jsx
│           ├── CollectionsPage.jsx
│           ├── DataPage.jsx
│           └── ProgressPage.jsx
├── server/
│   ├── package.json
│   ├── index.js
│   ├── db/
│   │   └── connection.js
│   ├── routes/
│   │   ├── health.js
│   │   ├── quiz.js
│   │   ├── collections.js
│   │   └── data.js
│   ├── data/
│   │   └── quizzes.js
│   └── lib/
│       └── queryRunner.js
├── schemas/
│   ├── clients.json
│   ├── projets.json
│   ├── employes.json
│   ├── appareils_iot.json
│   └── mesures_iot.json
├── data/
│   ├── clients.json
│   ├── projets.json
│   ├── employes.json
│   ├── appareils_iot.json
│   └── mesures_iot.json
└── backup/
    └── .gitkeep
```

## Dependency Graph

```
Task 1 (scaffolding) ──┬──> Task 2 (DB + health)──┬──> Task 5 (data routes) ───> Task 9 (export/backup)
                       │                           ├──> Task 6 (collections routes)
                       │                           ├──> Task 7 (query runner)──> Task 8 (quiz routes)
                       ├──> Task 3 (schemas)───────┘
                       ├──> Task 4 (demo data)─────┘
                       └──> Task 10 (client shell)─┬──> Task 11 (quiz UI)
                                                   ├──> Task 12 (collections+data pages)
                                                   └──> Task 13 (progression)
Task 14 (readme.txt) after all
```

**Parallel groups:**
- After Task 1: [2, 3, 4, 10] in parallel
- After Task 2+3+4: [5, 6, 7] in parallel
- After Task 7: [8]. After Task 5: [9]. Tasks 8 and 9 can run in parallel.
- After Task 10 + all server tasks: [11, 12, 13] in parallel

---

### Task 1: Monorepo Scaffolding

**Files:**
- Create: `mongolingo/package.json`
- Create: `mongolingo/server/package.json`
- Create: `mongolingo/server/index.js`
- Create: `mongolingo/client/package.json`
- Create: `mongolingo/client/index.html`
- Create: `mongolingo/client/vite.config.js`
- Create: `mongolingo/client/src/main.jsx`
- Create: `mongolingo/client/src/App.jsx`
- Create: `mongolingo/backup/.gitkeep`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "mongolingo",
  "private": true,
  "scripts": {
    "start": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && node index.js",
    "client": "cd client && npm run dev",
    "install:all": "npm install && cd server && npm install && cd ../client && npm install",
    "build": "cd client && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create server/package.json**

```json
{
  "name": "mongolingo-server",
  "private": true,
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mongodb": "^6.3.0",
    "archiver": "^6.0.1"
  }
}
```

- [ ] **Step 3: Create server/index.js (skeleton)**

```js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db/connection');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

async function start() {
  const db = await connectDB();
  app.locals.db = db;

  // Routes will be added in later tasks
  // app.use('/api/health', require('./routes/health'));
  // app.use('/api/quiz', require('./routes/quiz'));
  // app.use('/api/collections', require('./routes/collections'));
  // app.use('/api/data', require('./routes/data'));

  // Serve client build in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);
```

- [ ] **Step 4: Create client scaffolding**

`client/package.json`:
```json
{
  "name": "mongolingo-client",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.10"
  }
}
```

`client/vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
```

`client/index.html`:
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>mongolingo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`client/src/main.jsx`:
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`client/src/App.jsx`:
```jsx
export default function App() {
  return <div className="app"><p>mongolingo</p></div>;
}
```

- [ ] **Step 5: Create backup/.gitkeep**

Empty file.

- [ ] **Step 6: Install dependencies and verify**

```bash
cd mongolingo && npm run install:all
```

- [ ] **Step 7: Verify server starts**

```bash
cd mongolingo/server && node -e "const express = require('express'); console.log('OK')"
```

- [ ] **Step 8: Verify client starts**

```bash
cd mongolingo/client && npx vite --version
```

- [ ] **Step 9: Commit**

```bash
git add mongolingo/
git commit -m "feat: scaffold monorepo with Vite + Express"
```

---

### Task 2: MongoDB Connection + Health Route

**Files:**
- Create: `mongolingo/server/db/connection.js`
- Create: `mongolingo/server/routes/health.js`
- Modify: `mongolingo/server/index.js` (uncomment health route)

- [ ] **Step 1: Create connection.js**

```js
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'mongolingo';

let db = null;
let client = null;

async function connectDB() {
  if (db) return db;
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB: ${DB_NAME}`);
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not connected');
  return db;
}

function getClient() {
  return client;
}

module.exports = { connectDB, getDB, getClient };
```

- [ ] **Step 2: Create health.js**

```js
const { Router } = require('express');
const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.admin().ping();
    res.json({ status: 'connected', db: db.databaseName });
  } catch (err) {
    res.status(503).json({ status: 'disconnected', error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 3: Wire health route into index.js**

In `server/index.js`, uncomment:
```js
  app.use('/api/health', require('./routes/health'));
```

- [ ] **Step 4: Verify**

Start server, then:
```bash
curl http://localhost:3001/api/health
```
Expected: `{"status":"connected","db":"mongolingo"}`

- [ ] **Step 5: Commit**

```bash
git add mongolingo/server/db/ mongolingo/server/routes/health.js mongolingo/server/index.js
git commit -m "feat: add MongoDB connection and health endpoint"
```

---

### Task 3: JSON Schemas

**Files:**
- Create: `mongolingo/schemas/clients.json`
- Create: `mongolingo/schemas/projets.json`
- Create: `mongolingo/schemas/employes.json`
- Create: `mongolingo/schemas/appareils_iot.json`
- Create: `mongolingo/schemas/mesures_iot.json`

- [ ] **Step 1: Create schemas/clients.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "clients",
  "description": "Entreprises clientes de Cyberespar, specialisees dans le maritime et les technologies",
  "type": "object",
  "required": ["nom", "secteur", "ville"],
  "properties": {
    "nom": { "type": "string", "description": "Raison sociale du client" },
    "secteur": { "type": "string", "description": "Domaine d'activite du client" },
    "ville": { "type": "string", "description": "Ville du siege social" },
    "siret": { "type": "string", "pattern": "^[0-9]{14}$", "description": "Numero SIRET (14 chiffres)" },
    "contact": {
      "type": "object",
      "description": "Contact principal chez le client",
      "properties": {
        "nom": { "type": "string", "description": "Nom du contact" },
        "email": { "type": "string", "format": "email", "description": "Email professionnel" },
        "tel": { "type": "string", "description": "Telephone" }
      },
      "required": ["nom", "email"]
    }
  }
}
```

- [ ] **Step 2: Create schemas/projets.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "projets",
  "description": "Projets realises par Cyberespar pour ses clients (IoT, mobile, web)",
  "type": "object",
  "required": ["titre", "client_id", "technologies", "budget", "debut", "statut"],
  "properties": {
    "titre": { "type": "string", "description": "Nom du projet" },
    "client_id": { "type": "string", "description": "Reference vers le client (ObjectId)" },
    "technologies": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Stack technique utilisee"
    },
    "budget": { "type": "number", "minimum": 0, "description": "Budget en euros" },
    "debut": { "type": "string", "format": "date-time", "description": "Date de debut" },
    "fin": { "type": ["string", "null"], "format": "date-time", "description": "Date de fin (null si en cours)" },
    "statut": {
      "type": "string",
      "enum": ["planifie", "en cours", "termine"],
      "description": "Etat d'avancement"
    },
    "description": { "type": "string", "description": "Description courte du projet" }
  }
}
```

- [ ] **Step 3: Create schemas/employes.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "employes",
  "description": "Equipe Cyberespar avec competences, roles et projets assignes",
  "type": "object",
  "required": ["nom", "role", "competences", "salaire", "embauche"],
  "properties": {
    "nom": { "type": "string", "description": "Nom complet de l'employe" },
    "role": {
      "type": "string",
      "enum": ["fondateur", "lead dev", "dev fullstack", "dev frontend", "dev iot", "data engineer", "dev mobile", "devops"],
      "description": "Poste dans l'entreprise"
    },
    "competences": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Technologies maitrisees"
    },
    "projets": {
      "type": "array",
      "items": { "type": "string" },
      "description": "References vers les projets assignes (ObjectId)"
    },
    "salaire": { "type": "number", "description": "Salaire mensuel brut en euros" },
    "embauche": { "type": "string", "format": "date-time", "description": "Date d'embauche" }
  }
}
```

- [ ] **Step 4: Create schemas/appareils_iot.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "appareils_iot",
  "description": "Capteurs maritimes connectes utilises par les clients Cyberespar",
  "type": "object",
  "required": ["id_appareil", "type", "bateau", "actif"],
  "properties": {
    "id_appareil": { "type": "string", "description": "Identifiant unique de l'appareil (ex: CAPT-001)" },
    "type": {
      "type": "string",
      "enum": ["capteur_vent", "capteur_temp", "capteur_cap", "gps"],
      "description": "Type de capteur"
    },
    "bateau": { "type": "string", "description": "Nom du bateau equipe" },
    "config": {
      "type": "object",
      "properties": {
        "frequence_hz": { "type": "number", "description": "Frequence d'echantillonnage en Hz" },
        "seuil_alerte": { "type": "number", "description": "Valeur declenchant une alerte" }
      }
    },
    "localisation": {
      "type": "object",
      "properties": {
        "lat": { "type": "number", "description": "Latitude GPS" },
        "lng": { "type": "number", "description": "Longitude GPS" }
      }
    },
    "actif": { "type": "boolean", "description": "Appareil en service" }
  }
}
```

- [ ] **Step 5: Create schemas/mesures_iot.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "mesures_iot",
  "description": "Serie temporelle de releves capteurs maritimes",
  "type": "object",
  "required": ["appareil_id", "timestamp", "type", "valeur", "unite"],
  "properties": {
    "appareil_id": { "type": "string", "description": "Reference vers l'appareil (id_appareil)" },
    "timestamp": { "type": "string", "format": "date-time", "description": "Horodatage de la mesure" },
    "type": {
      "type": "string",
      "enum": ["vitesse_vent", "temperature_eau", "cap", "vitesse_gps"],
      "description": "Type de mesure"
    },
    "valeur": { "type": "number", "description": "Valeur numerique mesuree" },
    "unite": {
      "type": "string",
      "enum": ["noeuds", "celsius", "degres"],
      "description": "Unite de mesure"
    },
    "alerte": { "type": "boolean", "description": "Seuil d'alerte depasse" }
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add mongolingo/schemas/
git commit -m "feat: add JSON Schema definitions for 5 collections"
```

---

### Task 4: Demo Data

**Files:**
- Create: `mongolingo/data/clients.json`
- Create: `mongolingo/data/projets.json`
- Create: `mongolingo/data/employes.json`
- Create: `mongolingo/data/appareils_iot.json`
- Create: `mongolingo/data/mesures_iot.json`

**Context:** Data must be coherent across collections. Projets reference clients by `client_nom` field (resolved to ObjectId during load in Task 5). Employes reference projets by `projet_titres` (resolved during load). Mesures reference appareils by `appareil_id` string. All data is set in the Cyberespar Breton maritime universe.

- [ ] **Step 1: Create data/clients.json (10 documents)**

```json
[
  { "nom": "Mer Agitee", "secteur": "course a la voile", "ville": "Lorient", "siret": "12345678900012", "contact": { "nom": "Jean Dupont", "email": "j.dupont@meragitee.com", "tel": "0612345678" } },
  { "nom": "BreizhMarine", "secteur": "peche industrielle", "ville": "Concarneau", "siret": "23456789000023", "contact": { "nom": "Marie Le Bras", "email": "m.lebras@breizhmarine.fr", "tel": "0623456789" } },
  { "nom": "Atlantic Drones", "secteur": "drones sous-marins", "ville": "Brest", "siret": "34567890100034", "contact": { "nom": "Pierre Cozic", "email": "p.cozic@atlanticdrones.com", "tel": "0634567890" } },
  { "nom": "Voiles de l'Ouest", "secteur": "charter voiliers", "ville": "Vannes", "siret": "45678901200045", "contact": { "nom": "Sophie Guegan", "email": "s.guegan@voilesouest.fr", "tel": "0645678901" } },
  { "nom": "OceanTech Solutions", "secteur": "oceanographie", "ville": "Saint-Malo", "siret": "56789012300056", "contact": { "nom": "Luc Mahe", "email": "l.mahe@oceantech.fr", "tel": "0656789012" } },
  { "nom": "ArmorPeche", "secteur": "peche artisanale", "ville": "Douarnenez", "contact": { "nom": "Yves Kerlan", "email": "y.kerlan@armorpeche.bzh", "tel": "0667890123" } },
  { "nom": "NaviData", "secteur": "logistique maritime", "ville": "Nantes", "siret": "78901234500078", "contact": { "nom": "Claire Rouxel", "email": "c.rouxel@navidata.com", "tel": "0678901234" } },
  { "nom": "TideSoft", "secteur": "aquaculture", "ville": "Quimper", "siret": "89012345600089", "contact": { "nom": "Thomas Prigent", "email": "t.prigent@tidesoft.fr", "tel": "0689012345" } },
  { "nom": "GolfStream Analytics", "secteur": "meteo marine", "ville": "La Rochelle", "siret": "90123456700090", "contact": { "nom": "Anne Riviere", "email": "a.riviere@golfstream.fr", "tel": "0690123456" } },
  { "nom": "MarinConnect", "secteur": "tourisme nautique", "ville": "Saint-Nazaire", "siret": "01234567800001", "contact": { "nom": "Julien Moreau", "email": "j.moreau@marinconnect.com", "tel": "0601234567" } }
]
```

Note: `ArmorPeche` has no `siret` field intentionally (used in quiz Q12 about `$exists`).

- [ ] **Step 2: Create data/projets.json (20 documents)**

Field `client_nom` is resolved to `client_id` (ObjectId) during load.

```json
[
  { "titre": "TrimControl", "client_nom": "Mer Agitee", "technologies": ["React-Native", "MongoDB", "Node.js"], "budget": 12000, "debut": "2024-03-01T00:00:00Z", "fin": "2024-09-15T00:00:00Z", "statut": "termine", "description": "Application mobile de trimming pour voilier de course" },
  { "titre": "MarineWatch", "client_nom": "BreizhMarine", "technologies": ["React", "Node.js", "MongoDB"], "budget": 18000, "debut": "2025-01-15T00:00:00Z", "fin": null, "statut": "en cours", "description": "Dashboard de suivi de flotte de peche en temps reel" },
  { "titre": "SubDroneOS", "client_nom": "Atlantic Drones", "technologies": ["C++", "Python", "ROS"], "budget": 35000, "debut": "2023-06-01T00:00:00Z", "fin": "2024-12-01T00:00:00Z", "statut": "termine", "description": "Systeme d'exploitation embarque pour drone sous-marin autonome" },
  { "titre": "SkipperApp", "client_nom": "Voiles de l'Ouest", "technologies": ["React-Native", "MongoDB"], "budget": 8000, "debut": "2024-06-01T00:00:00Z", "fin": "2024-11-30T00:00:00Z", "statut": "termine", "description": "Application de reservation et suivi pour skippers" },
  { "titre": "OceanDashboard", "client_nom": "OceanTech Solutions", "technologies": ["React", "D3.js", "MongoDB", "Node.js"], "budget": 22000, "debut": "2025-02-01T00:00:00Z", "fin": null, "statut": "en cours", "description": "Plateforme de visualisation de donnees oceanographiques" },
  { "titre": "PecheTracker", "client_nom": "ArmorPeche", "technologies": ["React-Native", "Node.js", "MongoDB"], "budget": 9500, "debut": "2024-01-10T00:00:00Z", "fin": "2024-07-20T00:00:00Z", "statut": "termine", "description": "Suivi GPS et carnet de peche numerique" },
  { "titre": "CargoFlow", "client_nom": "NaviData", "technologies": ["React", "MongoDB", "Node.js", "Docker"], "budget": 28000, "debut": "2025-03-01T00:00:00Z", "fin": null, "statut": "en cours", "description": "Gestion logistique portuaire et suivi de conteneurs" },
  { "titre": "AquaMonitor", "client_nom": "TideSoft", "technologies": ["React", "Python", "MongoDB", "MQTT"], "budget": 15000, "debut": "2024-04-01T00:00:00Z", "fin": "2024-12-15T00:00:00Z", "statut": "termine", "description": "Monitoring qualite d'eau pour parcs aquacoles" },
  { "titre": "WaveForecast", "client_nom": "GolfStream Analytics", "technologies": ["Python", "MongoDB", "TensorFlow"], "budget": 42000, "debut": "2025-01-01T00:00:00Z", "fin": null, "statut": "en cours", "description": "Prevision de houle par machine learning" },
  { "titre": "NautiGuide", "client_nom": "MarinConnect", "technologies": ["React-Native", "MongoDB", "Node.js"], "budget": 11000, "debut": "2024-02-15T00:00:00Z", "fin": "2024-08-30T00:00:00Z", "statut": "termine", "description": "Guide touristique maritime interactif" },
  { "titre": "TrimControl v2", "client_nom": "Mer Agitee", "technologies": ["React-Native", "TypeScript", "MongoDB"], "budget": 14000, "debut": "2025-02-01T00:00:00Z", "fin": null, "statut": "en cours", "description": "Version 2 avec analyse de performance et IA embarquee" },
  { "titre": "FishRadar", "client_nom": "BreizhMarine", "technologies": ["Python", "MongoDB", "MQTT", "Docker"], "budget": 19000, "debut": "2025-06-01T00:00:00Z", "fin": null, "statut": "planifie", "description": "Detection de bancs de poissons par sonar connecte" },
  { "titre": "DroneNav", "client_nom": "Atlantic Drones", "technologies": ["C++", "Python", "MongoDB"], "budget": 25000, "debut": "2024-01-15T00:00:00Z", "fin": "2025-01-15T00:00:00Z", "statut": "termine", "description": "Navigation autonome et evitement d'obstacles sous-marins" },
  { "titre": "SailBooking", "client_nom": "Voiles de l'Ouest", "technologies": ["React", "Node.js", "Stripe", "MongoDB"], "budget": 16000, "debut": "2025-07-01T00:00:00Z", "fin": null, "statut": "planifie", "description": "Plateforme de reservation en ligne avec paiement" },
  { "titre": "TideAlert", "client_nom": "OceanTech Solutions", "technologies": ["React-Native", "MongoDB", "MQTT"], "budget": 13000, "debut": "2024-05-01T00:00:00Z", "fin": "2024-11-01T00:00:00Z", "statut": "termine", "description": "Alertes marees et courants pour navigation cotiere" },
  { "titre": "SeaLogger", "client_nom": "ArmorPeche", "technologies": ["Node.js", "MongoDB", "Arduino"], "budget": 7500, "debut": "2024-08-01T00:00:00Z", "fin": "2025-01-31T00:00:00Z", "statut": "termine", "description": "Enregistreur de donnees embarque pour chalutiers" },
  { "titre": "PortConnect", "client_nom": "NaviData", "technologies": ["React", "MongoDB", "Node.js", "WebSocket"], "budget": 31000, "debut": "2025-02-15T00:00:00Z", "fin": null, "statut": "en cours", "description": "Communication temps reel entre capitaineries et navires" },
  { "titre": "AlgaeWatch", "client_nom": "TideSoft", "technologies": ["React", "Python", "MongoDB", "OpenCV"], "budget": 20000, "debut": "2025-08-01T00:00:00Z", "fin": null, "statut": "planifie", "description": "Detection d'algues invasives par vision par ordinateur" },
  { "titre": "StormPredict", "client_nom": "GolfStream Analytics", "technologies": ["Python", "MongoDB", "TensorFlow", "AWS"], "budget": 38000, "debut": "2025-09-01T00:00:00Z", "fin": null, "statut": "planifie", "description": "Prediction de tempetes par analyse de donnees satellites" },
  { "titre": "CoastExplorer", "client_nom": "MarinConnect", "technologies": ["React-Native", "MongoDB", "Mapbox"], "budget": 12500, "debut": "2024-07-01T00:00:00Z", "fin": "2025-02-28T00:00:00Z", "statut": "termine", "description": "Decouverte du littoral breton avec cartographie interactive" }
]
```

- [ ] **Step 3: Create data/employes.json (8 documents)**

Field `projet_titres` is resolved to `projets` (ObjectId array) during load.

```json
[
  { "nom": "Goulven Kerbellec", "role": "fondateur", "competences": ["React", "React-Native", "MongoDB", "C++", "Java"], "projet_titres": ["TrimControl", "TrimControl v2", "SubDroneOS"], "salaire": 4500, "embauche": "2018-01-15T00:00:00Z" },
  { "nom": "Maelys Le Gall", "role": "lead dev", "competences": ["React", "TypeScript", "Node.js", "MongoDB"], "projet_titres": ["MarineWatch", "OceanDashboard", "CargoFlow", "PortConnect"], "salaire": 3800, "embauche": "2019-03-01T00:00:00Z" },
  { "nom": "Corentin Morvan", "role": "dev fullstack", "competences": ["React-Native", "Python", "MongoDB", "Docker"], "projet_titres": ["PecheTracker", "NautiGuide", "FishRadar"], "salaire": 3200, "embauche": "2020-09-01T00:00:00Z" },
  { "nom": "Enora Perrot", "role": "dev frontend", "competences": ["React", "CSS", "Figma", "TypeScript"], "projet_titres": ["OceanDashboard", "SailBooking", "CoastExplorer"], "salaire": 3000, "embauche": "2021-01-15T00:00:00Z" },
  { "nom": "Yann Jegou", "role": "dev iot", "competences": ["C++", "Arduino", "Python", "MQTT"], "projet_titres": ["SeaLogger", "AquaMonitor", "TideAlert"], "salaire": 3400, "embauche": "2020-03-01T00:00:00Z" },
  { "nom": "Nolwenn Cariou", "role": "data engineer", "competences": ["Python", "MongoDB", "Elasticsearch", "Kafka"], "projet_titres": ["WaveForecast", "StormPredict"], "salaire": 3600, "embauche": "2021-06-01T00:00:00Z" },
  { "nom": "Titouan Hemon", "role": "dev mobile", "competences": ["React-Native", "Swift", "Kotlin"], "projet_titres": ["SkipperApp", "TrimControl v2", "CoastExplorer"], "salaire": 3100, "embauche": "2022-01-10T00:00:00Z" },
  { "nom": "Anais Quere", "role": "devops", "competences": ["Docker", "Kubernetes", "AWS", "Linux"], "projet_titres": ["CargoFlow", "PortConnect", "DroneNav"], "salaire": 3500, "embauche": "2021-09-15T00:00:00Z" }
]
```

- [ ] **Step 4: Create data/appareils_iot.json (12 documents)**

```json
[
  { "id_appareil": "CAPT-001", "type": "capteur_vent", "bateau": "Mer Agitee IV", "config": { "frequence_hz": 10, "seuil_alerte": 40 }, "localisation": { "lat": 47.65, "lng": -2.76 }, "actif": true },
  { "id_appareil": "CAPT-002", "type": "capteur_temp", "bateau": "Mer Agitee IV", "config": { "frequence_hz": 5, "seuil_alerte": 25 }, "localisation": { "lat": 47.65, "lng": -2.76 }, "actif": true },
  { "id_appareil": "CAPT-003", "type": "gps", "bateau": "Mer Agitee IV", "config": { "frequence_hz": 1, "seuil_alerte": 0 }, "localisation": { "lat": 47.65, "lng": -2.76 }, "actif": true },
  { "id_appareil": "CAPT-004", "type": "capteur_vent", "bateau": "BreizhMarine I", "config": { "frequence_hz": 8, "seuil_alerte": 35 }, "localisation": { "lat": 47.87, "lng": -3.92 }, "actif": true },
  { "id_appareil": "CAPT-005", "type": "capteur_temp", "bateau": "BreizhMarine I", "config": { "frequence_hz": 5, "seuil_alerte": 22 }, "localisation": { "lat": 47.87, "lng": -3.92 }, "actif": true },
  { "id_appareil": "CAPT-006", "type": "capteur_cap", "bateau": "BreizhMarine I", "config": { "frequence_hz": 2, "seuil_alerte": 0 }, "localisation": { "lat": 47.87, "lng": -3.92 }, "actif": false },
  { "id_appareil": "CAPT-007", "type": "capteur_vent", "bateau": "SubDrone Alpha", "config": { "frequence_hz": 20, "seuil_alerte": 30 }, "localisation": { "lat": 48.39, "lng": -4.49 }, "actif": true },
  { "id_appareil": "CAPT-008", "type": "capteur_temp", "bateau": "SubDrone Alpha", "config": { "frequence_hz": 10, "seuil_alerte": 28 }, "localisation": { "lat": 48.39, "lng": -4.49 }, "actif": true },
  { "id_appareil": "CAPT-009", "type": "gps", "bateau": "Voilier Charter I", "config": { "frequence_hz": 1, "seuil_alerte": 0 }, "localisation": { "lat": 47.64, "lng": -2.78 }, "actif": true },
  { "id_appareil": "CAPT-010", "type": "capteur_vent", "bateau": "OceanLab II", "config": { "frequence_hz": 15, "seuil_alerte": 45 }, "localisation": { "lat": 48.65, "lng": -2.00 }, "actif": true },
  { "id_appareil": "CAPT-011", "type": "capteur_temp", "bateau": "AquaFarm I", "config": { "frequence_hz": 5, "seuil_alerte": 30 }, "localisation": { "lat": 47.99, "lng": -4.10 }, "actif": false },
  { "id_appareil": "CAPT-012", "type": "capteur_cap", "bateau": "CoastRunner", "config": { "frequence_hz": 2, "seuil_alerte": 0 }, "localisation": { "lat": 47.27, "lng": -2.21 }, "actif": true }
]
```

- [ ] **Step 5: Create data/mesures_iot.json (64 documents)**

Timestamps span 2026-03-14 to 2026-03-18. Alert values exceed the appareil's `seuil_alerte`.

```json
[
  { "appareil_id": "CAPT-001", "timestamp": "2026-03-14T06:00:00Z", "type": "vitesse_vent", "valeur": 18.3, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-001", "timestamp": "2026-03-14T12:00:00Z", "type": "vitesse_vent", "valeur": 25.7, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-001", "timestamp": "2026-03-15T06:00:00Z", "type": "vitesse_vent", "valeur": 42.1, "unite": "noeuds", "alerte": true },
  { "appareil_id": "CAPT-001", "timestamp": "2026-03-15T18:00:00Z", "type": "vitesse_vent", "valeur": 31.5, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-001", "timestamp": "2026-03-16T08:00:00Z", "type": "vitesse_vent", "valeur": 55.2, "unite": "noeuds", "alerte": true },
  { "appareil_id": "CAPT-001", "timestamp": "2026-03-17T10:00:00Z", "type": "vitesse_vent", "valeur": 12.8, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-002", "timestamp": "2026-03-14T06:30:00Z", "type": "temperature_eau", "valeur": 14.2, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-002", "timestamp": "2026-03-15T06:30:00Z", "type": "temperature_eau", "valeur": 13.8, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-002", "timestamp": "2026-03-16T06:30:00Z", "type": "temperature_eau", "valeur": 26.1, "unite": "celsius", "alerte": true },
  { "appareil_id": "CAPT-002", "timestamp": "2026-03-17T06:30:00Z", "type": "temperature_eau", "valeur": 15.0, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-002", "timestamp": "2026-03-18T06:30:00Z", "type": "temperature_eau", "valeur": 14.5, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-003", "timestamp": "2026-03-14T07:00:00Z", "type": "vitesse_gps", "valeur": 6.2, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-003", "timestamp": "2026-03-15T07:00:00Z", "type": "vitesse_gps", "valeur": 8.1, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-003", "timestamp": "2026-03-16T07:00:00Z", "type": "vitesse_gps", "valeur": 4.5, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-003", "timestamp": "2026-03-17T07:00:00Z", "type": "vitesse_gps", "valeur": 7.3, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-003", "timestamp": "2026-03-18T07:00:00Z", "type": "vitesse_gps", "valeur": 5.9, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-004", "timestamp": "2026-03-14T08:00:00Z", "type": "vitesse_vent", "valeur": 22.4, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-004", "timestamp": "2026-03-14T20:00:00Z", "type": "vitesse_vent", "valeur": 37.8, "unite": "noeuds", "alerte": true },
  { "appareil_id": "CAPT-004", "timestamp": "2026-03-15T08:00:00Z", "type": "vitesse_vent", "valeur": 28.9, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-004", "timestamp": "2026-03-16T14:00:00Z", "type": "vitesse_vent", "valeur": 41.3, "unite": "noeuds", "alerte": true },
  { "appareil_id": "CAPT-004", "timestamp": "2026-03-17T08:00:00Z", "type": "vitesse_vent", "valeur": 15.6, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-004", "timestamp": "2026-03-18T08:00:00Z", "type": "vitesse_vent", "valeur": 19.2, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-005", "timestamp": "2026-03-14T08:30:00Z", "type": "temperature_eau", "valeur": 12.1, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-005", "timestamp": "2026-03-15T08:30:00Z", "type": "temperature_eau", "valeur": 11.8, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-005", "timestamp": "2026-03-16T08:30:00Z", "type": "temperature_eau", "valeur": 23.5, "unite": "celsius", "alerte": true },
  { "appareil_id": "CAPT-005", "timestamp": "2026-03-17T08:30:00Z", "type": "temperature_eau", "valeur": 13.2, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-005", "timestamp": "2026-03-18T08:30:00Z", "type": "temperature_eau", "valeur": 12.7, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-006", "timestamp": "2026-03-14T09:00:00Z", "type": "cap", "valeur": 185.0, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-006", "timestamp": "2026-03-15T09:00:00Z", "type": "cap", "valeur": 220.5, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-006", "timestamp": "2026-03-16T09:00:00Z", "type": "cap", "valeur": 45.0, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-006", "timestamp": "2026-03-17T09:00:00Z", "type": "cap", "valeur": 310.2, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-006", "timestamp": "2026-03-18T09:00:00Z", "type": "cap", "valeur": 172.8, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-007", "timestamp": "2026-03-14T10:00:00Z", "type": "vitesse_vent", "valeur": 28.4, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-007", "timestamp": "2026-03-15T04:00:00Z", "type": "vitesse_vent", "valeur": 33.7, "unite": "noeuds", "alerte": true },
  { "appareil_id": "CAPT-007", "timestamp": "2026-03-15T16:00:00Z", "type": "vitesse_vent", "valeur": 19.1, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-007", "timestamp": "2026-03-16T10:00:00Z", "type": "vitesse_vent", "valeur": 45.6, "unite": "noeuds", "alerte": true },
  { "appareil_id": "CAPT-007", "timestamp": "2026-03-17T10:00:00Z", "type": "vitesse_vent", "valeur": 8.3, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-007", "timestamp": "2026-03-18T10:00:00Z", "type": "vitesse_vent", "valeur": 22.0, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-008", "timestamp": "2026-03-14T10:30:00Z", "type": "temperature_eau", "valeur": 10.5, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-008", "timestamp": "2026-03-15T10:30:00Z", "type": "temperature_eau", "valeur": 11.2, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-008", "timestamp": "2026-03-16T10:30:00Z", "type": "temperature_eau", "valeur": 29.8, "unite": "celsius", "alerte": true },
  { "appareil_id": "CAPT-008", "timestamp": "2026-03-17T10:30:00Z", "type": "temperature_eau", "valeur": 10.9, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-008", "timestamp": "2026-03-18T10:30:00Z", "type": "temperature_eau", "valeur": 11.0, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-009", "timestamp": "2026-03-14T11:00:00Z", "type": "vitesse_gps", "valeur": 5.4, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-009", "timestamp": "2026-03-15T11:00:00Z", "type": "vitesse_gps", "valeur": 7.8, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-009", "timestamp": "2026-03-16T11:00:00Z", "type": "vitesse_gps", "valeur": 3.2, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-009", "timestamp": "2026-03-17T11:00:00Z", "type": "vitesse_gps", "valeur": 6.5, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-009", "timestamp": "2026-03-18T11:00:00Z", "type": "vitesse_gps", "valeur": 4.1, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-010", "timestamp": "2026-03-14T12:00:00Z", "type": "vitesse_vent", "valeur": 32.1, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-010", "timestamp": "2026-03-15T00:00:00Z", "type": "vitesse_vent", "valeur": 51.4, "unite": "noeuds", "alerte": true },
  { "appareil_id": "CAPT-010", "timestamp": "2026-03-15T12:00:00Z", "type": "vitesse_vent", "valeur": 38.9, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-010", "timestamp": "2026-03-16T12:00:00Z", "type": "vitesse_vent", "valeur": 47.2, "unite": "noeuds", "alerte": true },
  { "appareil_id": "CAPT-010", "timestamp": "2026-03-17T12:00:00Z", "type": "vitesse_vent", "valeur": 21.0, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-010", "timestamp": "2026-03-18T12:00:00Z", "type": "vitesse_vent", "valeur": 29.5, "unite": "noeuds", "alerte": false },
  { "appareil_id": "CAPT-011", "timestamp": "2026-03-14T12:30:00Z", "type": "temperature_eau", "valeur": 16.3, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-011", "timestamp": "2026-03-15T12:30:00Z", "type": "temperature_eau", "valeur": 15.8, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-011", "timestamp": "2026-03-16T12:30:00Z", "type": "temperature_eau", "valeur": 31.2, "unite": "celsius", "alerte": true },
  { "appareil_id": "CAPT-011", "timestamp": "2026-03-17T12:30:00Z", "type": "temperature_eau", "valeur": 16.0, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-011", "timestamp": "2026-03-18T12:30:00Z", "type": "temperature_eau", "valeur": 2.1, "unite": "celsius", "alerte": false },
  { "appareil_id": "CAPT-012", "timestamp": "2026-03-14T13:00:00Z", "type": "cap", "valeur": 90.0, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-012", "timestamp": "2026-03-15T13:00:00Z", "type": "cap", "valeur": 135.5, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-012", "timestamp": "2026-03-16T13:00:00Z", "type": "cap", "valeur": 270.0, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-012", "timestamp": "2026-03-17T13:00:00Z", "type": "cap", "valeur": 0.5, "unite": "degres", "alerte": false },
  { "appareil_id": "CAPT-012", "timestamp": "2026-03-18T13:00:00Z", "type": "cap", "valeur": 198.3, "unite": "degres", "alerte": false }
]
```

Note: `CAPT-011` last entry has `valeur: 2.1` and `alerte: false` — used in Q17 (`deleteMany` where `alerte: false` and `valeur < 5`).

- [ ] **Step 6: Commit**

```bash
git add mongolingo/data/
git commit -m "feat: add demo data for 5 Cyberespar collections"
```

---

### Task 5: Data Loading + Collections Routes

**Files:**
- Create: `mongolingo/server/routes/data.js` (partial — load only; export/backup in Task 9)
- Create: `mongolingo/server/routes/collections.js`
- Modify: `mongolingo/server/index.js` (wire routes)

**Depends on:** Task 2 (DB connection), Task 3 (schemas), Task 4 (data files)

- [ ] **Step 1: Create routes/data.js (load endpoint only)**

```js
const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router();

const DATA_DIR = path.join(__dirname, '../../data');

router.post('/load', async (req, res) => {
  try {
    const db = req.app.locals.db;

    // 1. Drop existing collections
    const existing = await db.listCollections().toArray();
    for (const col of existing) {
      await db.collection(col.name).drop();
    }

    // 2. Load clients
    const clientsRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'clients.json'), 'utf-8'));
    const clientResult = await db.collection('clients').insertMany(clientsRaw);
    const clientMap = {};
    clientsRaw.forEach((c, i) => { clientMap[c.nom] = clientResult.insertedIds[i]; });

    // 3. Load projets — resolve client_nom to client_id ObjectId
    const projetsRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projets.json'), 'utf-8'));
    const projets = projetsRaw.map(p => ({
      ...p,
      client_id: clientMap[p.client_nom] || null,
      debut: new Date(p.debut),
      fin: p.fin ? new Date(p.fin) : null,
    }));
    projets.forEach(p => delete p.client_nom);
    const projetResult = await db.collection('projets').insertMany(projets);
    const projetMap = {};
    projetsRaw.forEach((p, i) => { projetMap[p.titre] = projetResult.insertedIds[i]; });

    // 4. Load employes — resolve projet_titres to projets ObjectId array
    const employesRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'employes.json'), 'utf-8'));
    const employes = employesRaw.map(e => ({
      ...e,
      projets: (e.projet_titres || []).map(t => projetMap[t]).filter(Boolean),
      embauche: new Date(e.embauche),
    }));
    employes.forEach(e => delete e.projet_titres);
    await db.collection('employes').insertMany(employes);

    // 5. Load appareils_iot (no ObjectId refs needed)
    const appareils = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'appareils_iot.json'), 'utf-8'));
    await db.collection('appareils_iot').insertMany(appareils);

    // 6. Load mesures_iot — convert timestamps
    const mesuresRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'mesures_iot.json'), 'utf-8'));
    const mesures = mesuresRaw.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
    await db.collection('mesures_iot').insertMany(mesures);

    // Count results
    const counts = {};
    for (const name of ['clients', 'projets', 'employes', 'appareils_iot', 'mesures_iot']) {
      counts[name] = await db.collection(name).countDocuments();
    }

    res.json({ success: true, counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 2: Create routes/collections.js**

```js
const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router();

const SCHEMAS_DIR = path.join(__dirname, '../../schemas');
const ALLOWED_COLLECTIONS = ['clients', 'projets', 'employes', 'appareils_iot', 'mesures_iot'];

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const collections = [];
    for (const name of ALLOWED_COLLECTIONS) {
      const stats = await db.collection(name).aggregate([
        { $group: { _id: null, count: { $sum: 1 } } }
      ]).toArray();
      collections.push({
        name,
        count: stats[0]?.count || 0,
      });
    }
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:name/schema', (req, res) => {
  const { name } = req.params;
  if (!ALLOWED_COLLECTIONS.includes(name)) {
    return res.status(404).json({ error: 'Collection inconnue' });
  }
  const schemaPath = path.join(SCHEMAS_DIR, `${name}.json`);
  if (!fs.existsSync(schemaPath)) {
    return res.status(404).json({ error: 'Schema non trouve' });
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  res.json(schema);
});

router.get('/:name/sample', async (req, res) => {
  const { name } = req.params;
  if (!ALLOWED_COLLECTIONS.includes(name)) {
    return res.status(404).json({ error: 'Collection inconnue' });
  }
  try {
    const db = req.app.locals.db;
    const docs = await db.collection(name).find({}).limit(3).toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 3: Wire routes in server/index.js**

Uncomment / add:
```js
  app.use('/api/health', require('./routes/health'));
  app.use('/api/collections', require('./routes/collections'));
  app.use('/api/data', require('./routes/data'));
```

- [ ] **Step 4: Verify — load data**

```bash
# Start server, then:
curl -X POST http://localhost:3001/api/data/load
```
Expected: `{"success":true,"counts":{"clients":10,"projets":20,"employes":8,"appareils_iot":12,"mesures_iot":64}}`

- [ ] **Step 5: Verify — collections list**

```bash
curl http://localhost:3001/api/collections
```

- [ ] **Step 6: Verify — schema + sample**

```bash
curl http://localhost:3001/api/collections/clients/schema
curl http://localhost:3001/api/collections/clients/sample
```

- [ ] **Step 7: Commit**

```bash
git add mongolingo/server/routes/data.js mongolingo/server/routes/collections.js mongolingo/server/index.js
git commit -m "feat: add data loading and collections API routes"
```

---

### Task 6: Quiz Data (31 Questions)

**Files:**
- Create: `mongolingo/server/data/quizzes.js`

**No dependencies beyond Task 1.**

- [ ] **Step 1: Create server/data/quizzes.js**

All 31 quiz questions. Modes: `qcm`, `blancs`, `libre`. Field `auto_execute_on_reveal` is `true` for read queries, `false` for mutations.

```js
const quizzes = [
  // ═══════════════════════════════════════════
  // NIVEAU 1 — Lecture basique (6 questions)
  // ═══════════════════════════════════════════
  {
    id: 1,
    niveau: 1,
    mode: "qcm",
    collection: "clients",
    enonce: "Retourner tous les clients",
    hint: "La methode find() sans filtre retourne tout.",
    options: [
      'db.clients.find({})',
      'db.clients.findAll()',
      'db.clients.get({})',
      'db.clients.select(*)'
    ],
    correct: 0,
    solution: {
      query: 'db.clients.find({})',
      explanation: "find({}) sans filtre retourne tous les documents de la collection. Le parametre {} signifie 'aucun critere de filtrage'.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 2,
    niveau: 1,
    mode: "qcm",
    collection: "clients",
    enonce: "Trouver le client nomme 'Mer Agitee'",
    hint: "findOne retourne un seul document.",
    options: [
      'db.clients.findOne({ nom: "Mer Agitee" })',
      'db.clients.find({ name: "Mer Agitee" })',
      'db.clients.search({ nom: "Mer Agitee" })',
      'db.clients.get({ nom: "Mer Agitee" })'
    ],
    correct: 0,
    solution: {
      query: 'db.clients.findOne({ nom: "Mer Agitee" })',
      explanation: "findOne retourne le premier document correspondant au filtre. Le champ s'appelle 'nom' (pas 'name').",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 3,
    niveau: 1,
    mode: "blancs",
    collection: "clients",
    enonce: "Afficher uniquement le nom et le secteur de chaque client (sans le _id)",
    hint: "Le second argument de find() est la projection. 1 = inclure, 0 = exclure.",
    template: 'db.clients.find({}, { ___: 1, ___: 1, _id: 0 })',
    blanks: ["nom", "secteur"],
    solution: {
      query: 'db.clients.find({}, { nom: 1, secteur: 1, _id: 0 })',
      explanation: "Le second argument de find() est la projection. 1 inclut le champ, 0 l'exclut. _id est inclus par defaut, il faut l'exclure explicitement avec _id: 0.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 4,
    niveau: 1,
    mode: "qcm",
    collection: "appareils_iot",
    enonce: "Compter le nombre total d'appareils IoT",
    hint: "countDocuments compte les documents correspondant au filtre.",
    options: [
      'db.appareils_iot.countDocuments({})',
      'db.appareils_iot.count()',
      'db.appareils_iot.length()',
      'db.appareils_iot.size()'
    ],
    correct: 0,
    solution: {
      query: 'db.appareils_iot.countDocuments({})',
      explanation: "countDocuments({}) compte tous les documents de la collection. Avec un filtre vide {}, il retourne le total.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 5,
    niveau: 1,
    mode: "blancs",
    collection: "projets",
    enonce: "Trier les projets par date de debut, du plus recent au plus ancien",
    hint: "sort() avec -1 pour l'ordre decroissant.",
    template: 'db.projets.find({}).sort({ ___: ___ })',
    blanks: ["debut", "-1"],
    solution: {
      query: 'db.projets.find({}).sort({ debut: -1 })',
      explanation: "sort() ordonne les resultats. -1 = ordre decroissant (plus recent d'abord), 1 = croissant (plus ancien d'abord).",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 6,
    niveau: 1,
    mode: "qcm",
    collection: "mesures_iot",
    enonce: "Afficher les 3 mesures IoT les plus recentes",
    hint: "Combine sort() et limit().",
    options: [
      'db.mesures_iot.find({}).sort({ timestamp: -1 }).limit(3)',
      'db.mesures_iot.find({}).limit(3).sort({ timestamp: -1 })',
      'db.mesures_iot.findTop(3, { timestamp: -1 })',
      'db.mesures_iot.find({ limit: 3 }).sort({ timestamp: -1 })'
    ],
    correct: 0,
    solution: {
      query: 'db.mesures_iot.find({}).sort({ timestamp: -1 }).limit(3)',
      explanation: "On chaine sort() puis limit(). sort({ timestamp: -1 }) trie du plus recent au plus ancien, limit(3) ne garde que les 3 premiers resultats.",
      auto_execute_on_reveal: true
    }
  },

  // ═══════════════════════════════════════════
  // NIVEAU 2 — Filtres & operateurs (8 questions)
  // ═══════════════════════════════════════════
  {
    id: 7,
    niveau: 2,
    mode: "blancs",
    collection: "projets",
    enonce: "Trouver les projets avec un budget superieur a 5000 euros",
    hint: "$gt = greater than (strictement superieur).",
    template: 'db.projets.find({ budget: { ___: ___ } })',
    blanks: ["$gt", "5000"],
    solution: {
      query: 'db.projets.find({ budget: { $gt: 5000 } })',
      explanation: "$gt (greater than) filtre les documents ou le champ est strictement superieur a la valeur. Autres operateurs : $gte (>=), $lt (<), $lte (<=), $ne (!=).",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 8,
    niveau: 2,
    mode: "qcm",
    collection: "appareils_iot",
    enonce: "Trouver les appareils de type capteur_vent ou capteur_temp",
    hint: "$in verifie si la valeur est dans un tableau.",
    options: [
      'db.appareils_iot.find({ type: { $in: ["capteur_vent", "capteur_temp"] } })',
      'db.appareils_iot.find({ type: "capteur_vent" || "capteur_temp" })',
      'db.appareils_iot.find({ $or: { type: "capteur_vent", type: "capteur_temp" } })',
      'db.appareils_iot.find({ type: ["capteur_vent", "capteur_temp"] })'
    ],
    correct: 0,
    solution: {
      query: 'db.appareils_iot.find({ type: { $in: ["capteur_vent", "capteur_temp"] } })',
      explanation: "$in selectionne les documents ou le champ correspond a l'une des valeurs du tableau. C'est l'equivalent du IN en SQL.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 9,
    niveau: 2,
    mode: "blancs",
    collection: "mesures_iot",
    enonce: "Trouver les mesures ou l'alerte est declenchee ET la valeur depasse 50",
    hint: "Plusieurs conditions dans le meme objet = ET logique.",
    template: 'db.mesures_iot.find({ alerte: ___, valeur: { ___: ___ } })',
    blanks: ["true", "$gt", "50"],
    solution: {
      query: 'db.mesures_iot.find({ alerte: true, valeur: { $gt: 50 } })',
      explanation: "Plusieurs conditions dans le meme objet filtre agissent comme un ET logique implicite. Pas besoin de $and explicite ici.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 10,
    niveau: 2,
    mode: "qcm",
    collection: "employes",
    enonce: "Trouver les employes qui maitrisent React",
    hint: "Pour chercher dans un tableau, testez directement la valeur.",
    options: [
      'db.employes.find({ competences: "React" })',
      'db.employes.find({ competences: { $contains: "React" } })',
      'db.employes.find({ competences: { $has: "React" } })',
      'db.employes.find({ "competences.0": "React" })'
    ],
    correct: 0,
    solution: {
      query: 'db.employes.find({ competences: "React" })',
      explanation: "Pour chercher dans un tableau, il suffit de tester l'egalite avec une valeur. MongoDB verifie automatiquement si la valeur est presente dans le tableau.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 11,
    niveau: 2,
    mode: "blancs",
    collection: "projets",
    enonce: "Trouver les projets utilisant a la fois React ET MongoDB",
    hint: "$all exige que toutes les valeurs soient presentes dans le tableau.",
    template: 'db.projets.find({ technologies: { ___: ["React", "MongoDB"] } })',
    blanks: ["$all"],
    solution: {
      query: 'db.projets.find({ technologies: { $all: ["React", "MongoDB"] } })',
      explanation: "$all selectionne les documents ou le tableau contient TOUS les elements specifies, quel que soit l'ordre. Contrairement a $in qui fait un OU.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 12,
    niveau: 2,
    mode: "qcm",
    collection: "clients",
    enonce: "Trouver les clients qui possedent un numero SIRET",
    hint: "$exists verifie la presence d'un champ.",
    options: [
      'db.clients.find({ siret: { $exists: true } })',
      'db.clients.find({ siret: { $ne: null } })',
      'db.clients.find({ siret: true })',
      'db.clients.find({ $has: "siret" })'
    ],
    correct: 0,
    solution: {
      query: 'db.clients.find({ siret: { $exists: true } })',
      explanation: "$exists: true selectionne les documents ou le champ existe, meme si sa valeur est null. Utile avec les schemas flexibles de MongoDB.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 13,
    niveau: 2,
    mode: "blancs",
    collection: "appareils_iot",
    enonce: "Trouver les appareils dont la latitude est superieure a 47.5",
    hint: "La notation pointee accede aux sous-documents.",
    template: 'db.appareils_iot.find({ "___": { ___: ___ } })',
    blanks: ["localisation.lat", "$gt", "47.5"],
    solution: {
      query: 'db.appareils_iot.find({ "localisation.lat": { $gt: 47.5 } })',
      explanation: "La notation pointee (dot notation) permet d'acceder aux champs imbriques. Les guillemets sont obligatoires quand le nom du champ contient un point.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 14,
    niveau: 2,
    mode: "qcm",
    collection: "projets",
    enonce: "Trouver les projets dont la description contient le mot 'maritime'",
    hint: "$regex permet d'utiliser des expressions regulieres.",
    options: [
      'db.projets.find({ description: { $regex: /maritime/i } })',
      'db.projets.find({ description: { $contains: "maritime" } })',
      'db.projets.find({ description: { $like: "%maritime%" } })',
      'db.projets.find({ description: { $search: "maritime" } })'
    ],
    correct: 0,
    solution: {
      query: 'db.projets.find({ description: { $regex: /maritime/i } })',
      explanation: "$regex filtre avec une expression reguliere. Le flag /i rend la recherche insensible a la casse. Equivalent du LIKE en SQL mais plus puissant.",
      auto_execute_on_reveal: true
    }
  },

  // ═══════════════════════════════════════════
  // NIVEAU 3 — Modifications & index (6 questions)
  // ═══════════════════════════════════════════
  {
    id: 15,
    niveau: 3,
    mode: "blancs",
    collection: "projets",
    enonce: "Mettre a jour le statut du projet 'TrimControl' a 'en cours'",
    hint: "$set modifie la valeur d'un champ.",
    template: 'db.projets.updateOne({ titre: "TrimControl" }, { ___: { ___: "en cours" } })',
    blanks: ["$set", "statut"],
    solution: {
      query: 'db.projets.updateOne({ titre: "TrimControl" }, { $set: { statut: "en cours" } })',
      explanation: "updateOne modifie le premier document correspondant au filtre. $set remplace la valeur du champ specifie sans toucher aux autres champs.",
      auto_execute_on_reveal: false
    }
  },
  {
    id: 16,
    niveau: 3,
    mode: "qcm",
    collection: "employes",
    enonce: "Ajouter la competence 'Python' a Goulven Kerbellec sans creer de doublon",
    hint: "$addToSet ajoute uniquement si la valeur n'existe pas deja.",
    options: [
      'db.employes.updateOne({ nom: "Goulven Kerbellec" }, { $addToSet: { competences: "Python" } })',
      'db.employes.updateOne({ nom: "Goulven Kerbellec" }, { $push: { competences: "Python" } })',
      'db.employes.updateOne({ nom: "Goulven Kerbellec" }, { $set: { competences: "Python" } })',
      'db.employes.updateOne({ nom: "Goulven Kerbellec" }, { $add: { competences: "Python" } })'
    ],
    correct: 0,
    solution: {
      query: 'db.employes.updateOne({ nom: "Goulven Kerbellec" }, { $addToSet: { competences: "Python" } })',
      explanation: "$addToSet ajoute une valeur au tableau uniquement si elle n'y est pas deja. $push ajouterait un doublon. $set remplacerait tout le tableau.",
      auto_execute_on_reveal: false
    }
  },
  {
    id: 17,
    niveau: 3,
    mode: "libre",
    collection: "mesures_iot",
    enonce: "Supprimer toutes les mesures ou l'alerte est fausse ET la valeur est inferieure a 5",
    hint: "deleteMany supprime tous les documents correspondant au filtre. Combine alerte: false et $lt.",
    solution: {
      query: 'db.mesures_iot.deleteMany({ alerte: false, valeur: { $lt: 5 } })',
      explanation: "deleteMany supprime tous les documents correspondant au filtre. Les deux conditions agissent comme un ET implicite.",
      auto_execute_on_reveal: false
    }
  },
  {
    id: 18,
    niveau: 3,
    mode: "blancs",
    collection: "projets",
    enonce: "Incrementer le budget du projet 'TrimControl' de 1000 euros",
    hint: "$inc ajoute une valeur numerique au champ.",
    template: 'db.projets.updateOne({ titre: "TrimControl" }, { ___: { ___: ___ } })',
    blanks: ["$inc", "budget", "1000"],
    solution: {
      query: 'db.projets.updateOne({ titre: "TrimControl" }, { $inc: { budget: 1000 } })',
      explanation: "$inc incremente atomiquement la valeur d'un champ numerique. Une valeur negative permet de decrementer (ex: $inc: { budget: -500 }).",
      auto_execute_on_reveal: false
    }
  },
  {
    id: 19,
    niveau: 3,
    mode: "libre",
    collection: "appareils_iot",
    enonce: "Creer un index croissant sur le champ 'type' de la collection appareils_iot",
    hint: "createIndex({ champ: 1 }) cree un index croissant.",
    solution: {
      query: 'db.appareils_iot.createIndex({ type: 1 })',
      explanation: "createIndex cree un index pour accelerer les requetes. 1 = index croissant, -1 = decroissant. Les index sont essentiels pour la performance sur les grandes collections.",
      auto_execute_on_reveal: false
    }
  },
  {
    id: 20,
    niveau: 3,
    mode: "libre",
    collection: "clients",
    enonce: "Inserer ou mettre a jour le client 'NovaMer' (upsert) avec le secteur 'aquaculture' et la ville 'Brest'",
    hint: "updateOne avec l'option { upsert: true } en troisieme argument.",
    solution: {
      query: 'db.clients.updateOne({ nom: "NovaMer" }, { $set: { nom: "NovaMer", secteur: "aquaculture", ville: "Brest" } }, { upsert: true })',
      explanation: "upsert = update + insert. Si le filtre ne correspond a aucun document, un nouveau document est cree avec les valeurs de $set. Sinon, le document existant est mis a jour.",
      auto_execute_on_reveal: false
    }
  },

  // ═══════════════════════════════════════════
  // NIVEAU 4 — Agregation (7 questions)
  // ═══════════════════════════════════════════
  {
    id: 21,
    niveau: 4,
    mode: "blancs",
    collection: "projets",
    enonce: "Compter le nombre de projets par statut",
    hint: "$group avec _id pour regrouper et $sum: 1 pour compter.",
    template: 'db.projets.aggregate([{ ___: { _id: "___", count: { ___: 1 } } }])',
    blanks: ["$group", "$statut", "$sum"],
    solution: {
      query: 'db.projets.aggregate([{ $group: { _id: "$statut", count: { $sum: 1 } } }])',
      explanation: "$group regroupe les documents par la valeur du champ _id. '$statut' (avec le $) reference la valeur du champ statut. $sum: 1 compte le nombre de documents par groupe.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 22,
    niveau: 4,
    mode: "blancs",
    collection: "projets",
    enonce: "Calculer le budget moyen des projets par client",
    hint: "$avg calcule la moyenne dans un $group.",
    template: 'db.projets.aggregate([{ $group: { _id: "___", budget_moyen: { ___: "___" } } }])',
    blanks: ["$client_id", "$avg", "$budget"],
    solution: {
      query: 'db.projets.aggregate([{ $group: { _id: "$client_id", budget_moyen: { $avg: "$budget" } } }])',
      explanation: "$avg calcule la moyenne des valeurs du champ dans chaque groupe. Le resultat contient un _id (le client_id) et la moyenne calculee.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 23,
    niveau: 4,
    mode: "libre",
    collection: "projets",
    enonce: "Jointure : afficher chaque projet avec les informations du client correspondant",
    hint: "$lookup joint deux collections. localField est le champ source, foreignField le champ cible.",
    solution: {
      query: 'db.projets.aggregate([{ $lookup: { from: "clients", localField: "client_id", foreignField: "_id", as: "client" } }])',
      explanation: "$lookup effectue une jointure gauche (left outer join). from = collection cible, localField = champ dans projets, foreignField = champ dans clients, as = nom du champ resultat (tableau).",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 24,
    niveau: 4,
    mode: "libre",
    collection: "projets",
    enonce: "Lister toutes les technologies utilisees et compter combien de projets utilisent chacune",
    hint: "$unwind decompose un tableau, puis $group pour compter.",
    solution: {
      query: 'db.projets.aggregate([{ $unwind: "$technologies" }, { $group: { _id: "$technologies", count: { $sum: 1 } } }, { $sort: { count: -1 } }])',
      explanation: "$unwind cree un document par element du tableau 'technologies'. Ensuite $group regroupe par technologie et $sum: 1 compte les occurrences. $sort trie par nombre decroissant.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 25,
    niveau: 4,
    mode: "libre",
    collection: "mesures_iot",
    enonce: "Calculer la valeur moyenne des mesures par appareil pour les mesures du 17 mars 2026",
    hint: "$match filtre les documents en entree, $group + $avg pour la moyenne par groupe.",
    solution: {
      query: 'db.mesures_iot.aggregate([{ $match: { timestamp: { $gte: ISODate("2026-03-17T00:00:00Z"), $lt: ISODate("2026-03-18T00:00:00Z") } } }, { $group: { _id: "$appareil_id", moyenne: { $avg: "$valeur" } } }])',
      explanation: "$match filtre les documents en entree du pipeline (ici par date). Puis $group calcule la moyenne ($avg) de 'valeur' pour chaque appareil_id.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 26,
    niveau: 4,
    mode: "libre",
    collection: "employes",
    enonce: "Afficher le top 3 des employes ayant le plus de projets assignes",
    hint: "$project avec $size pour compter les elements, puis $sort et $limit.",
    solution: {
      query: 'db.employes.aggregate([{ $project: { nom: 1, nb_projets: { $size: "$projets" } } }, { $sort: { nb_projets: -1 } }, { $limit: 3 }])',
      explanation: "$project transforme les documents. $size retourne le nombre d'elements d'un tableau. Combine avec $sort (decroissant) et $limit, on obtient le top N.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 27,
    niveau: 4,
    mode: "libre",
    collection: "projets",
    enonce: "Repartir les projets en tranches de budget : 0-5000, 5000-10000, 10000-20000, 20000-50000",
    hint: "$bucket decoupe les valeurs en intervalles (boundaries).",
    solution: {
      query: 'db.projets.aggregate([{ $bucket: { groupBy: "$budget", boundaries: [0, 5000, 10000, 20000, 50000], default: "Autre", output: { count: { $sum: 1 }, projets: { $push: "$titre" } } } }])',
      explanation: "$bucket repartit les documents en tranches selon les boundaries. Chaque tranche contient les documents dont la valeur est >= borne inferieure et < borne superieure. 'default' capture les valeurs hors limites.",
      auto_execute_on_reveal: true
    }
  },

  // ═══════════════════════════════════════════
  // NIVEAU 5 — Pipelines complexes (4 questions)
  // ═══════════════════════════════════════════
  {
    id: 28,
    niveau: 5,
    mode: "libre",
    collection: "mesures_iot",
    enonce: "Pipeline : trouver les mesures en alerte, joindre les informations de l'appareil, et afficher l'appareil, le bateau et la valeur",
    hint: "$match pour filtrer, $lookup pour joindre appareils_iot, $unwind pour decomposer, $project pour selectionner.",
    solution: {
      query: 'db.mesures_iot.aggregate([{ $match: { alerte: true } }, { $lookup: { from: "appareils_iot", localField: "appareil_id", foreignField: "id_appareil", as: "appareil" } }, { $unwind: "$appareil" }, { $project: { appareil_id: 1, valeur: 1, type: 1, bateau: "$appareil.bateau", appareil_type: "$appareil.type" } }])',
      explanation: "Pipeline multi-etapes : $match filtre les alertes, $lookup joint les appareils par id, $unwind decompose le tableau de jointure (1 seul appareil par mesure), $project selectionne et renomme les champs.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 29,
    niveau: 5,
    mode: "libre",
    collection: "projets",
    enonce: "Generer un rapport multi-facettes : nombre de projets par statut, budget total, et technologies les plus utilisees",
    hint: "$facet execute plusieurs sous-pipelines en parallele sur les memes donnees.",
    solution: {
      query: 'db.projets.aggregate([{ $facet: { par_statut: [{ $group: { _id: "$statut", count: { $sum: 1 } } }], budget_total: [{ $group: { _id: null, total: { $sum: "$budget" } } }], technologies: [{ $unwind: "$technologies" }, { $group: { _id: "$technologies", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }] } }])',
      explanation: "$facet execute plusieurs sous-pipelines independants sur le meme jeu de donnees. Chaque facette produit son propre resultat. Ici on obtient 3 vues differentes en une seule requete.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 30,
    niveau: 5,
    mode: "libre",
    collection: "mesures_iot",
    enonce: "Pipeline : grouper les mesures d'alerte par bateau (via jointure appareils) et compter le nombre d'alertes par bateau",
    hint: "$match les alertes, $lookup vers appareils_iot, $unwind, puis $group par bateau.",
    solution: {
      query: 'db.mesures_iot.aggregate([{ $match: { alerte: true } }, { $lookup: { from: "appareils_iot", localField: "appareil_id", foreignField: "id_appareil", as: "appareil" } }, { $unwind: "$appareil" }, { $group: { _id: "$appareil.bateau", nb_alertes: { $sum: 1 }, valeur_max: { $max: "$valeur" } } }, { $sort: { nb_alertes: -1 } }])',
      explanation: "Pipeline complet : filtre ($match), jointure ($lookup), decomposition ($unwind), regroupement ($group) et tri ($sort). On traverse les collections pour obtenir des statistiques croisees.",
      auto_execute_on_reveal: true
    }
  },
  {
    id: 31,
    niveau: 5,
    mode: "libre",
    collection: "projets",
    enonce: "Analyser les performances de la requete 'projets avec budget > 10000' avec explain",
    hint: "Ajoute .explain(\"executionStats\") a la fin d'une requete find.",
    solution: {
      query: 'db.projets.find({ budget: { $gt: 10000 } }).explain("executionStats")',
      explanation: "explain('executionStats') affiche le plan d'execution : nombre de documents examines vs retournes, utilisation d'index, temps d'execution. Un ratio examine/retourne eleve indique qu'un index serait benefique.",
      auto_execute_on_reveal: true
    }
  }
];

module.exports = quizzes;
```

- [ ] **Step 2: Verify file loads without error**

```bash
cd mongolingo/server && node -e "const q = require('./data/quizzes'); console.log(q.length + ' quizzes loaded')"
```
Expected: `31 quizzes loaded`

- [ ] **Step 3: Commit**

```bash
git add mongolingo/server/data/quizzes.js
git commit -m "feat: add 31 quiz questions across 5 difficulty levels"
```

---

### Task 7: Query Execution Engine

**Files:**
- Create: `mongolingo/server/lib/queryRunner.js`

**Depends on:** Task 2 (MongoDB connection)

This is the security-critical component. It parses MongoDB shell syntax (`db.collection.method(args)`), validates methods against a whitelist, and executes via the native driver. Never uses `eval`.

- [ ] **Step 1: Create server/lib/queryRunner.js**

```js
const vm = require('vm');
const { ObjectId } = require('mongodb');

const ALLOWED_METHODS = new Set([
  'find', 'findOne', 'aggregate', 'countDocuments', 'distinct',
  'updateOne', 'updateMany', 'deleteOne', 'deleteMany',
  'insertOne', 'insertMany', 'createIndex', 'explain',
  'sort', 'limit', 'skip'
]);

function parseChain(str) {
  const methods = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === '.') {
      i++;
      let name = '';
      while (i < str.length && str[i] !== '(') {
        name += str[i++];
      }
      if (str[i] === '(') {
        i++;
        let depth = 1;
        let args = '';
        while (i < str.length && depth > 0) {
          // Skip over string literals to avoid counting brackets inside strings
          if (str[i] === '"' || str[i] === "'") {
            const quote = str[i];
            args += str[i++];
            while (i < str.length && str[i] !== quote) {
              if (str[i] === '\\') { args += str[i++]; } // skip escaped chars
              if (i < str.length) { args += str[i++]; }
            }
            if (i < str.length) { args += str[i++]; } // closing quote
            continue;
          }
          if (str[i] === '(' || str[i] === '[') depth++;
          if (str[i] === ')' || str[i] === ']') depth--;
          if (depth > 0) args += str[i];
          i++;
        }
        methods.push({ name, args: args.trim() });
      }
    } else {
      i++;
    }
  }
  return methods;
}

function parseArgs(argsStr) {
  if (!argsStr) return [];
  const sandbox = {
    ObjectId: (id) => new ObjectId(id),
    ISODate: (s) => new Date(s),
  };
  const context = vm.createContext(sandbox);
  try {
    return vm.runInContext(`[${argsStr}]`, context, { timeout: 1000 });
  } catch (err) {
    throw new Error(`Erreur de syntaxe dans les arguments: ${err.message}`);
  }
}

function parseQuery(queryStr) {
  const trimmed = queryStr.trim();
  if (!trimmed.startsWith('db.')) {
    throw new Error('La requete doit commencer par "db."');
  }

  const withoutDb = trimmed.slice(3);
  const firstDot = withoutDb.indexOf('.');
  if (firstDot === -1) {
    throw new Error('Format attendu: db.collection.methode(...)');
  }

  const collection = withoutDb.substring(0, firstDot);
  const rest = withoutDb.substring(firstDot);
  const methods = parseChain(rest);

  if (methods.length === 0) {
    throw new Error('Aucune methode detectee');
  }

  for (const m of methods) {
    if (!ALLOWED_METHODS.has(m.name)) {
      throw new Error(`Methode non autorisee: "${m.name}". Methodes autorisees: ${[...ALLOWED_METHODS].join(', ')}`);
    }
  }

  return { collection, methods };
}

async function executeQuery(db, collection, methods) {
  const col = db.collection(collection);
  const first = methods[0];
  const args = parseArgs(first.args);

  if (first.name === 'aggregate') {
    const pipeline = args[0] || [];
    const cursor = col.aggregate(pipeline);
    if (methods.length > 1 && methods[methods.length - 1].name === 'explain') {
      const explainArgs = parseArgs(methods[methods.length - 1].args);
      return cursor.explain(explainArgs[0] || true);
    }
    return cursor.toArray();
  }

  if (first.name === 'find') {
    const filter = args[0] || {};
    const projection = args[1] || undefined;
    let cursor = col.find(filter, projection ? { projection } : {});

    for (let i = 1; i < methods.length; i++) {
      const m = methods[i];
      const mArgs = parseArgs(m.args);
      if (m.name === 'sort') cursor = cursor.sort(mArgs[0]);
      else if (m.name === 'limit') cursor = cursor.limit(mArgs[0]);
      else if (m.name === 'skip') cursor = cursor.skip(mArgs[0]);
      else if (m.name === 'explain') return cursor.explain(mArgs[0] || true);
    }
    return cursor.toArray();
  }

  if (first.name === 'findOne') {
    const filter = args[0] || {};
    const projection = args[1] || undefined;
    return col.findOne(filter, projection ? { projection } : {});
  }

  if (first.name === 'countDocuments') {
    return col.countDocuments(args[0] || {});
  }

  if (first.name === 'distinct') {
    return col.distinct(args[0], args[1] || {});
  }

  if (first.name === 'updateOne' || first.name === 'updateMany') {
    return col[first.name](args[0], args[1], args[2] || {});
  }

  if (first.name === 'deleteOne' || first.name === 'deleteMany') {
    return col[first.name](args[0]);
  }

  if (first.name === 'insertOne') {
    return col.insertOne(args[0]);
  }

  if (first.name === 'insertMany') {
    return col.insertMany(args[0]);
  }

  if (first.name === 'createIndex') {
    return col.createIndex(args[0], args[1] || {});
  }

  throw new Error(`Methode non implementee: ${first.name}`);
}

async function runQuery(db, queryStr, timeoutMs = 3000) {
  const { collection, methods } = parseQuery(queryStr);

  const result = await Promise.race([
    executeQuery(db, collection, methods),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: la requete a depasse 3 secondes')), timeoutMs)
    )
  ]);

  return result;
}

module.exports = { runQuery, parseQuery, parseArgs };
```

- [ ] **Step 2: Test the whitelist rejects forbidden methods**

```bash
cd mongolingo/server && node -e "
const { parseQuery } = require('./lib/queryRunner');
try { parseQuery('db.clients.drop()'); console.log('FAIL: should reject drop'); }
catch(e) { console.log('OK: ' + e.message); }
try { parseQuery('db.clients.find({})'); console.log('OK: find allowed'); }
catch(e) { console.log('FAIL: ' + e.message); }
"
```
Expected:
```
OK: Methode non autorisee: "drop". Methodes autorisees: ...
OK: find allowed
```

- [ ] **Step 3: Test arg parsing**

```bash
cd mongolingo/server && node -e "
const { parseArgs } = require('./lib/queryRunner');
const r = parseArgs('{ nom: \"test\" }, { nom: 1, _id: 0 }');
console.log(JSON.stringify(r));
"
```
Expected: `[{"nom":"test"},{"nom":1,"_id":0}]`

- [ ] **Step 4: Commit**

```bash
git add mongolingo/server/lib/queryRunner.js
git commit -m "feat: add query execution engine with method whitelist"
```

---

### Task 8: Quiz API Routes

**Files:**
- Create: `mongolingo/server/routes/quiz.js`
- Modify: `mongolingo/server/index.js` (wire quiz routes)

**Depends on:** Task 6 (quiz data), Task 7 (query runner)

- [ ] **Step 1: Create server/routes/quiz.js**

```js
const { Router } = require('express');
const quizzes = require('../data/quizzes');
const { runQuery } = require('../lib/queryRunner');

const router = Router();

// GET /api/quiz — list all (without solutions)
router.get('/', (req, res) => {
  const list = quizzes.map(q => ({
    id: q.id,
    niveau: q.niveau,
    mode: q.mode,
    enonce: q.enonce,
    collection: q.collection,
  }));
  res.json(list);
});

// GET /api/quiz/:id — full quiz with solution
router.get('/:id', (req, res) => {
  const quiz = quizzes.find(q => q.id === parseInt(req.params.id));
  if (!quiz) return res.status(404).json({ error: 'Quiz non trouve' });
  res.json(quiz);
});

// GET /api/quiz/:id/hint
router.get('/:id/hint', (req, res) => {
  const quiz = quizzes.find(q => q.id === parseInt(req.params.id));
  if (!quiz) return res.status(404).json({ error: 'Quiz non trouve' });
  res.json({ hint: quiz.hint });
});

// POST /api/quiz/:id/run — execute a query
router.post('/:id/run', async (req, res) => {
  const quiz = quizzes.find(q => q.id === parseInt(req.params.id));
  if (!quiz) return res.status(404).json({ error: 'Quiz non trouve' });

  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Le champ "query" est requis' });
  }

  try {
    const db = req.app.locals.db;
    const data = await runQuery(db, query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 2: Wire in server/index.js**

Add before the production static serving block:
```js
  app.use('/api/quiz', require('./routes/quiz'));
```

- [ ] **Step 3: Verify — list quizzes**

```bash
curl http://localhost:3001/api/quiz | head -c 200
```

- [ ] **Step 4: Verify — get quiz detail**

```bash
curl http://localhost:3001/api/quiz/1
```

- [ ] **Step 5: Verify — run a query**

```bash
curl -X POST http://localhost:3001/api/quiz/1/run \
  -H 'Content-Type: application/json' \
  -d '{"query": "db.clients.find({})"}'
```

- [ ] **Step 6: Verify — blocked method**

```bash
curl -X POST http://localhost:3001/api/quiz/1/run \
  -H 'Content-Type: application/json' \
  -d '{"query": "db.clients.drop()"}'
```
Expected: `{"success":false,"error":"Methode non autorisee: \"drop\"..."}`

- [ ] **Step 7: Commit**

```bash
git add mongolingo/server/routes/quiz.js mongolingo/server/index.js
git commit -m "feat: add quiz API routes with query execution"
```

---

### Task 9: Export + Backup Routes

**Files:**
- Modify: `mongolingo/server/routes/data.js` (add export/backup/restore endpoints)

**Depends on:** Task 5 (data routes base)

- [ ] **Step 1: Add export/backup routes to data.js**

Add the following requires at the **top** of `server/routes/data.js` (after the existing `const path = ...` line), then append the route handlers **before** `module.exports`:

```js
// — Add these requires at the top of the file —
const archiver = require('archiver');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

const BACKUP_DIR = path.join(__dirname, '../../backup');
const COLLECTIONS = ['clients', 'projets', 'employes', 'appareils_iot', 'mesures_iot'];

// GET /api/data/export/json — ZIP of all collections as JSON
router.get('/export/json', async (req, res) => {
  try {
    const db = req.app.locals.db;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=mongolingo-export.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const name of COLLECTIONS) {
      const docs = await db.collection(name).find({}).toArray();
      archive.append(JSON.stringify(docs, null, 2), { name: `${name}.json` });
    }

    await archive.finalize();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/data/export/bson — mongodump
router.get('/export/bson', async (req, res) => {
  try {
    const tmpDir = path.join(BACKUP_DIR, `_tmp_export_${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    await execFileAsync('mongodump', [
      '--db', 'mongolingo',
      '--out', tmpDir
    ]);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=mongolingo-bson.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(path.join(tmpDir, 'mongolingo'), 'mongolingo');

    archive.on('end', () => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    await archive.finalize();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/data/backup — timestamped backup in backup/
router.post('/backup', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });

    await execFileAsync('mongodump', [
      '--db', 'mongolingo',
      '--out', backupPath
    ]);

    res.json({ success: true, path: `backup/backup-${timestamp}`, timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/data/restore — restore from most recent backup (or body.path)
router.post('/restore', async (req, res) => {
  try {
    let restorePath;

    if (req.body.path) {
      restorePath = path.join(__dirname, '../..', req.body.path, 'mongolingo');
    } else {
      // Find most recent backup
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();

      if (backups.length === 0) {
        return res.status(404).json({ error: 'Aucune sauvegarde trouvee' });
      }
      restorePath = path.join(BACKUP_DIR, backups[0], 'mongolingo');
    }

    if (!fs.existsSync(restorePath)) {
      return res.status(404).json({ error: 'Dossier de sauvegarde introuvable' });
    }

    await execFileAsync('mongorestore', [
      '--db', 'mongolingo',
      '--drop',
      restorePath
    ]);

    res.json({ success: true, restored_from: restorePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Step 2: Verify JSON export**

```bash
curl http://localhost:3001/api/data/export/json -o /tmp/test-export.zip && unzip -l /tmp/test-export.zip
```

- [ ] **Step 3: Verify backup**

```bash
curl -X POST http://localhost:3001/api/data/backup
```

- [ ] **Step 4: Commit**

```bash
git add mongolingo/server/routes/data.js
git commit -m "feat: add JSON/BSON export and backup/restore endpoints"
```

---

### Task 10: Client App Shell + Dark Theme

**Files:**
- Create: `mongolingo/client/src/index.css`
- Modify: `mongolingo/client/src/App.jsx`
- Create: `mongolingo/client/src/components/Layout.jsx`
- Create: `mongolingo/client/src/components/Topbar.jsx`
- Create: `mongolingo/client/src/pages/QuizPage.jsx` (stub)
- Create: `mongolingo/client/src/pages/CollectionsPage.jsx` (stub)
- Create: `mongolingo/client/src/pages/DataPage.jsx` (stub)
- Create: `mongolingo/client/src/pages/ProgressPage.jsx` (stub)

**Depends on:** Task 1 only.

- [ ] **Step 1: Create index.css (complete dark theme)**

```css
:root {
  --bg-primary: #09090b;
  --bg-surface: #18181b;
  --bg-elevated: #27272a;
  --border: #27272a;
  --border-subtle: #1e1e21;
  --text-primary: #e4e4e7;
  --text-secondary: #a1a1aa;
  --text-tertiary: #52525b;
  --accent: #818cf8;
  --accent-hover: #6366f1;
  --accent-dim: rgba(129, 140, 248, 0.1);
  --code-green: #4ade80;
  --code-blue: #60a5fa;
  --code-orange: #f59e0b;
  --success: #4ade80;
  --error: #f87171;
  --warning: #f59e0b;
  --radius: 6px;
  --radius-lg: 8px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

code, pre, .mono {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
}

/* ──── Topbar ──── */
.topbar {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 24px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-brand {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  margin-right: 32px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  letter-spacing: -0.5px;
}

.topbar-links { display: flex; gap: 2px; }

.topbar-links a {
  text-decoration: none;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 13px;
  transition: color 0.15s, background 0.15s;
}
.topbar-links a:hover { color: var(--text-primary); background: var(--bg-elevated); }
.topbar-links a.active { color: var(--text-primary); background: var(--bg-elevated); }

.topbar-status {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-tertiary);
}
.topbar-status.connected .status-dot { background: var(--success); }
.topbar-status.disconnected .status-dot { background: var(--error); }
.topbar-status.checking .status-dot { background: var(--warning); }

/* ──── Main ──── */
.main {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* ──── Typography ──── */
h1 { font-size: 20px; font-weight: 600; margin-bottom: 24px; }
h2 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text-secondary); }

/* ──── Buttons ──── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.btn:hover { background: var(--bg-elevated); border-color: var(--text-tertiary); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-accent {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.btn-accent:hover { background: var(--accent-hover); border-color: var(--accent-hover); }

.btn-small { padding: 4px 10px; font-size: 12px; }

.btn-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover { color: var(--text-primary); background: var(--bg-elevated); }

/* ──── Code blocks ──── */
.code-block {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
  color: var(--code-green);
}

.code-inline {
  background: var(--bg-elevated);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: var(--code-blue);
}

/* ──── Cards ──── */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}

/* ──── Quiz specific ──── */
.quiz-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.quiz-level, .quiz-mode {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 3px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.quiz-enonce {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* QCM options */
.qcm-options { display: flex; flex-direction: column; gap: 8px; }

.qcm-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--code-green);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.qcm-option:hover { border-color: var(--accent); background: var(--accent-dim); }
.qcm-option.correct { border-color: var(--success); background: rgba(74, 222, 128, 0.1); }
.qcm-option.incorrect { border-color: var(--error); background: rgba(248, 113, 113, 0.1); }
.qcm-option.disabled { cursor: default; opacity: 0.6; }

/* Fill blanks */
.fill-template {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 2;
  color: var(--code-green);
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.blank-input {
  background: var(--bg-primary);
  border: 1px solid var(--accent);
  border-radius: 3px;
  color: var(--code-orange);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  padding: 2px 8px;
  width: auto;
  min-width: 80px;
}
.blank-input:focus { outline: none; border-color: var(--accent-hover); box-shadow: 0 0 0 2px var(--accent-dim); }
.blank-input.correct { border-color: var(--success); }
.blank-input.incorrect { border-color: var(--error); }

/* Free input */
.query-input {
  width: 100%;
  min-height: 120px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--code-green);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  padding: 12px 16px;
  resize: vertical;
  line-height: 1.7;
}
.query-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }

/* Result display */
.result-block {
  color: var(--code-blue);
  max-height: 300px;
  overflow-y: auto;
}

/* Solution */
.solution {
  margin-top: 24px;
  padding: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.solution h3 { margin-bottom: 12px; color: var(--accent); }
.explanation {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* ──── Level select ──── */
.level-grid { display: flex; flex-direction: column; gap: 16px; }

.level-group h2 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.quiz-list { display: flex; flex-direction: column; gap: 4px; }

.quiz-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
}
.quiz-item:hover { background: var(--bg-surface); }

.quiz-item .quiz-id {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: monospace;
  min-width: 24px;
}
.quiz-item .quiz-text { font-size: 14px; flex: 1; }
.quiz-item .quiz-badge {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--bg-elevated);
  color: var(--text-tertiary);
}
.quiz-item.completed .quiz-id { color: var(--success); }

/* ──── Collections ──── */
.collection-list { display: flex; flex-direction: column; gap: 12px; }

.collection-card {
  padding: 16px 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color 0.15s;
}
.collection-card:hover { border-color: var(--text-tertiary); }
.collection-card.active { border-color: var(--accent); }

.collection-name { font-weight: 600; font-size: 14px; }
.collection-count { font-size: 12px; color: var(--text-tertiary); margin-left: 8px; }
.collection-desc { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

.schema-viewer {
  margin-top: 16px;
  padding: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.schema-field {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.schema-field:last-child { border-bottom: none; }
.field-name { font-family: monospace; font-size: 13px; color: var(--code-green); min-width: 160px; }
.field-type { font-size: 12px; color: var(--code-orange); min-width: 80px; }
.field-desc { font-size: 13px; color: var(--text-secondary); }

/* ──── Data page ──── */
.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.data-status {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: var(--radius);
  font-size: 13px;
}
.data-status.success { background: rgba(74, 222, 128, 0.1); color: var(--success); border: 1px solid rgba(74, 222, 128, 0.2); }
.data-status.error { background: rgba(248, 113, 113, 0.1); color: var(--error); border: 1px solid rgba(248, 113, 113, 0.2); }

/* ──── Progress page ──── */
.progress-bar-container {
  width: 100%;
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
  margin: 8px 0;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-align: center;
}
.stat-value { font-size: 24px; font-weight: 600; color: var(--accent); }
.stat-label { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; }

/* ──── Utilities ──── */
.loading { color: var(--text-tertiary); font-size: 14px; padding: 32px; text-align: center; }
.back-btn { margin-bottom: 16px; }
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }
.gap-8 { gap: 8px; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
```

- [ ] **Step 2: Create components/Topbar.jsx**

```jsx
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Topbar() {
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    const check = () => {
      fetch('/api/health')
        .then(r => r.json())
        .then(d => setDbStatus(d.status === 'connected' ? 'connected' : 'disconnected'))
        .catch(() => setDbStatus('disconnected'));
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="topbar">
      <div className="topbar-brand">mongolingo</div>
      <div className="topbar-links">
        <NavLink to="/">Quiz</NavLink>
        <NavLink to="/collections">Collections</NavLink>
        <NavLink to="/data">Donnees</NavLink>
        <NavLink to="/progress">Progression</NavLink>
      </div>
      <div className={`topbar-status ${dbStatus}`}>
        <span className="status-dot"></span>
        MongoDB
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create components/Layout.jsx**

```jsx
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div className="app">
      <Topbar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create page stubs**

`pages/QuizPage.jsx`:
```jsx
export default function QuizPage() {
  return <div><h1>Quiz MongoDB</h1><p className="loading">A venir...</p></div>;
}
```

`pages/CollectionsPage.jsx`:
```jsx
export default function CollectionsPage() {
  return <div><h1>Collections Cyberespar</h1><p className="loading">A venir...</p></div>;
}
```

`pages/DataPage.jsx`:
```jsx
export default function DataPage() {
  return <div><h1>Gestion des donnees</h1><p className="loading">A venir...</p></div>;
}
```

`pages/ProgressPage.jsx`:
```jsx
export default function ProgressPage() {
  return <div><h1>Progression</h1><p className="loading">A venir...</p></div>;
}
```

- [ ] **Step 5: Update App.jsx with routing**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import QuizPage from './pages/QuizPage';
import CollectionsPage from './pages/CollectionsPage';
import DataPage from './pages/DataPage';
import ProgressPage from './pages/ProgressPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<QuizPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 6: Verify — open browser to http://localhost:5173**

Check: dark background, topbar with navigation links, MongoDB status indicator, page routing works.

- [ ] **Step 7: Commit**

```bash
git add mongolingo/client/src/
git commit -m "feat: add client app shell with dark theme, routing, and topbar"
```

---

### Task 11: Quiz Page + Components

**Files:**
- Modify: `mongolingo/client/src/pages/QuizPage.jsx`
- Create: `mongolingo/client/src/components/Quiz/LevelSelect.jsx`
- Create: `mongolingo/client/src/components/Quiz/QuizRunner.jsx`
- Create: `mongolingo/client/src/components/Quiz/QCM.jsx`
- Create: `mongolingo/client/src/components/Quiz/FillBlanks.jsx`
- Create: `mongolingo/client/src/components/Quiz/FreeInput.jsx`
- Create: `mongolingo/client/src/hooks/useProgress.js`

**Depends on:** Task 10 (app shell), Task 8 (quiz API)

- [ ] **Step 1: Create hooks/useProgress.js**

```jsx
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mongolingo-progress';

const initialState = { completed: [], history: [] };

export default function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const markCompleted = (quizId, answer, correct) => {
    setProgress(prev => ({
      completed: correct && !prev.completed.includes(quizId)
        ? [...prev.completed, quizId]
        : prev.completed,
      history: [
        ...prev.history,
        { quizId, answer, correct, timestamp: new Date().toISOString() }
      ]
    }));
  };

  const isCompleted = (quizId) => progress.completed.includes(quizId);

  const reset = () => {
    setProgress(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { progress, markCompleted, isCompleted, reset };
}
```

- [ ] **Step 2: Create components/Quiz/LevelSelect.jsx**

```jsx
const LEVELS = [
  { niveau: 1, titre: 'Lecture basique', desc: 'find, findOne, sort, limit, countDocuments' },
  { niveau: 2, titre: 'Filtres et operateurs', desc: '$gt, $in, $all, $exists, $regex, dot notation' },
  { niveau: 3, titre: 'Modifications et index', desc: '$set, $inc, $addToSet, deleteMany, createIndex, upsert' },
  { niveau: 4, titre: 'Agregation', desc: '$group, $lookup, $unwind, $bucket, $project' },
  { niveau: 5, titre: 'Pipelines complexes', desc: '$facet, multi-lookup, explain' },
];

export default function LevelSelect({ quizzes, onSelectQuiz, isCompleted }) {
  return (
    <div className="level-grid">
      {LEVELS.map(level => {
        const levelQuizzes = quizzes.filter(q => q.niveau === level.niveau);
        const completedCount = levelQuizzes.filter(q => isCompleted(q.id)).length;
        return (
          <div key={level.niveau} className="level-group">
            <div className="flex items-center justify-between">
              <h2>Niveau {level.niveau} — {level.titre}</h2>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {completedCount}/{levelQuizzes.length}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>{level.desc}</p>
            <div className="quiz-list">
              {levelQuizzes.map(q => (
                <div
                  key={q.id}
                  className={`quiz-item ${isCompleted(q.id) ? 'completed' : ''}`}
                  onClick={() => onSelectQuiz(q)}
                >
                  <span className="quiz-id">{String(q.id).padStart(2, '0')}</span>
                  <span className="quiz-text">{q.enonce}</span>
                  <span className="quiz-badge">{q.mode}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create components/Quiz/QCM.jsx**

```jsx
import { useState } from 'react';

export default function QCM({ quiz, onResult }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    const correct = index === quiz.correct;
    onResult(correct, quiz.options[index]);
  };

  return (
    <div className="qcm-options">
      {quiz.options.map((opt, i) => {
        let cls = 'qcm-option';
        if (answered) {
          cls += ' disabled';
          if (i === quiz.correct) cls += ' correct';
          else if (i === selected) cls += ' incorrect';
        }
        return (
          <button key={i} className={cls} onClick={() => handleSelect(i)}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create components/Quiz/FillBlanks.jsx**

```jsx
import { useState } from 'react';

export default function FillBlanks({ quiz, onResult }) {
  const [values, setValues] = useState(quiz.blanks.map(() => ''));
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState(null);

  const handleChange = (index, val) => {
    const next = [...values];
    next[index] = val;
    setValues(next);
  };

  const handleSubmit = () => {
    const res = values.map((v, i) => v.trim() === quiz.blanks[i]);
    setResults(res);
    setAnswered(true);
    const correct = res.every(Boolean);
    onResult(correct, values.join(', '));
  };

  // Render template with input fields replacing ___
  const parts = quiz.template.split('___');

  return (
    <div>
      <div className="fill-template">
        {parts.map((part, i) => {
          const bi = i; // blank index = part index (N parts → N-1 blanks)
          return (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <input
                  className={`blank-input ${answered ? (results[bi] ? 'correct' : 'incorrect') : ''}`}
                  value={values[bi]}
                  onChange={e => handleChange(bi, e.target.value)}
                  disabled={answered}
                  placeholder="..."
                  style={{ width: Math.max(80, (quiz.blanks[bi]?.length || 5) * 10 + 20) }}
                />
              )}
            </span>
          );
        })}
      </div>
      {!answered && (
        <button className="btn btn-accent mt-16" onClick={handleSubmit}>
          Valider
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create components/Quiz/FreeInput.jsx**

```jsx
import { useState } from 'react';

export default function FreeInput({ quiz, onResult }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        onResult(true, query.trim());
      } else {
        setError(data.error);
        onResult(false, query.trim());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        className="query-input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={`db.${quiz.collection}.`}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleExecute(); }}
      />
      <div className="flex gap-8 mt-16">
        <button className="btn btn-accent" onClick={handleExecute} disabled={loading || !query.trim()}>
          {loading ? 'Execution...' : 'Executer (Ctrl+Enter)'}
        </button>
      </div>
      {error && <div className="data-status error mt-16">{error}</div>}
      {result !== null && (
        <div className="mt-16">
          <h3>Resultat</h3>
          <pre className="code-block result-block">
            {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create components/Quiz/QuizRunner.jsx**

```jsx
import { useState, useEffect } from 'react';
import QCM from './QCM';
import FillBlanks from './FillBlanks';
import FreeInput from './FreeInput';

export default function QuizRunner({ quiz, onBack, onComplete }) {
  const [fullQuiz, setFullQuiz] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionResult, setSolutionResult] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    fetch(`/api/quiz/${quiz.id}`)
      .then(r => r.json())
      .then(setFullQuiz);
  }, [quiz.id]);

  if (!fullQuiz) return <div className="loading">Chargement...</div>;

  const handleResult = (correct, answer) => {
    setAnswered(true);
    onComplete(quiz.id, answer, correct);
  };

  const handleRevealSolution = async () => {
    setShowSolution(true);
    if (fullQuiz.solution.auto_execute_on_reveal) {
      try {
        const res = await fetch(`/api/quiz/${quiz.id}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: fullQuiz.solution.query })
        });
        const data = await res.json();
        if (data.success) setSolutionResult(data.data);
      } catch {}
    }
  };

  const handleGetHint = async () => {
    const res = await fetch(`/api/quiz/${quiz.id}/hint`);
    const data = await res.json();
    alert(data.hint);
  };

  const ModeComponent = { qcm: QCM, blancs: FillBlanks, libre: FreeInput }[fullQuiz.mode];

  return (
    <div>
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        ← Retour
      </button>

      <div className="quiz-header">
        <span className="quiz-level">Niveau {fullQuiz.niveau}</span>
        <span className="quiz-mode">{fullQuiz.mode}</span>
        <span className="quiz-mode">{fullQuiz.collection}</span>
      </div>

      <h2 className="quiz-enonce">{fullQuiz.enonce}</h2>

      <ModeComponent quiz={fullQuiz} onResult={handleResult} />

      <div className="flex gap-8 mt-24">
        {!showSolution && (
          <>
            <button className="btn" onClick={handleGetHint}>Indice</button>
            <button className="btn" onClick={handleRevealSolution}>Voir la solution</button>
          </>
        )}
      </div>

      {showSolution && (
        <div className="solution mt-24">
          <h3>Solution</h3>
          <pre className="code-block">{fullQuiz.solution.query}</pre>
          <p className="explanation">{fullQuiz.solution.explanation}</p>
          {solutionResult !== null && (
            <div className="mt-16">
              <h3>Resultat reel</h3>
              <pre className="code-block result-block">
                {JSON.stringify(solutionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Update QuizPage.jsx**

```jsx
import { useState, useEffect } from 'react';
import LevelSelect from '../components/Quiz/LevelSelect';
import QuizRunner from '../components/Quiz/QuizRunner';
import useProgress from '../hooks/useProgress';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const { progress, markCompleted, isCompleted } = useProgress();

  useEffect(() => {
    fetch('/api/quiz').then(r => r.json()).then(setQuizzes);
  }, []);

  if (currentQuiz) {
    return (
      <QuizRunner
        quiz={currentQuiz}
        onBack={() => setCurrentQuiz(null)}
        onComplete={markCompleted}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 0 }}>Quiz MongoDB</h1>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {progress.completed.length}/31
        </span>
      </div>
      <div className="progress-bar-container" style={{ marginBottom: 24 }}>
        <div className="progress-bar-fill" style={{ width: `${(progress.completed.length / 31) * 100}%` }} />
      </div>
      <LevelSelect
        quizzes={quizzes}
        onSelectQuiz={setCurrentQuiz}
        isCompleted={isCompleted}
      />
    </div>
  );
}
```

- [ ] **Step 8: Verify — browse to / and test quiz flow**

Check: level list displays, clicking a quiz opens runner, QCM options work, free input executes queries.

- [ ] **Step 9: Commit**

```bash
git add mongolingo/client/src/
git commit -m "feat: add quiz page with QCM, fill-blanks, and free-input modes"
```

---

### Task 12: Collections + Data + Progress Pages

**Files:**
- Modify: `mongolingo/client/src/pages/CollectionsPage.jsx`
- Modify: `mongolingo/client/src/pages/DataPage.jsx`
- Modify: `mongolingo/client/src/pages/ProgressPage.jsx`

**Depends on:** Task 10 (app shell), Task 5/9 (API routes)

- [ ] **Step 1: Update CollectionsPage.jsx**

```jsx
import { useState, useEffect } from 'react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [schema, setSchema] = useState(null);
  const [sample, setSample] = useState(null);

  useEffect(() => {
    fetch('/api/collections').then(r => r.json()).then(setCollections);
  }, []);

  const selectCollection = async (name) => {
    setSelected(name);
    const [schemaRes, sampleRes] = await Promise.all([
      fetch(`/api/collections/${name}/schema`).then(r => r.json()),
      fetch(`/api/collections/${name}/sample`).then(r => r.json()),
    ]);
    setSchema(schemaRes);
    setSample(sampleRes);
  };

  const renderProperties = (properties, required = []) => {
    if (!properties) return null;
    return Object.entries(properties).map(([key, val]) => (
      <div key={key} className="schema-field">
        <span className="field-name">
          {key}
          {required.includes(key) && <span style={{ color: 'var(--error)', marginLeft: 4 }}>*</span>}
        </span>
        <span className="field-type">{val.type}{val.enum ? ` [${val.enum.join(', ')}]` : ''}</span>
        <span className="field-desc">{val.description || ''}</span>
      </div>
    ));
  };

  return (
    <div>
      <h1>Collections Cyberespar</h1>
      <div className="collection-list">
        {collections.map(c => (
          <div
            key={c.name}
            className={`collection-card ${selected === c.name ? 'active' : ''}`}
            onClick={() => selectCollection(c.name)}
          >
            <span className="collection-name">{c.name}</span>
            <span className="collection-count">{c.count} documents</span>
          </div>
        ))}
      </div>

      {selected && schema && (
        <div className="schema-viewer">
          <h2>{schema.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{schema.description}</p>

          <h3>Schema</h3>
          {renderProperties(schema.properties, schema.required)}

          {sample && sample.length > 0 && (
            <div className="mt-24">
              <h3>Exemples</h3>
              <pre className="code-block result-block">
                {JSON.stringify(sample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update DataPage.jsx**

```jsx
import { useState } from 'react';

export default function DataPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const action = async (url, method = 'POST') => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/data/${url}`, { method });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: JSON.stringify(data, null, 2) });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const download = (url, filename) => {
    const a = document.createElement('a');
    a.href = `/api/data/${url}`;
    a.download = filename;
    a.click();
  };

  return (
    <div>
      <h1>Gestion des donnees</h1>

      <h2>Chargement</h2>
      <div className="data-actions">
        <button className="btn btn-accent" onClick={() => action('load')} disabled={loading}>
          {loading ? 'Chargement...' : 'Charger les donnees de demo'}
        </button>
      </div>

      <h2>Export</h2>
      <div className="data-actions">
        <button className="btn" onClick={() => download('export/json', 'mongolingo-export.zip')}>
          Export JSON (zip)
        </button>
        <button className="btn" onClick={() => download('export/bson', 'mongolingo-bson.zip')}>
          Export BSON (mongodump)
        </button>
      </div>

      <h2>Sauvegarde</h2>
      <div className="data-actions">
        <button className="btn" onClick={() => action('backup')} disabled={loading}>
          Creer une sauvegarde
        </button>
        <button className="btn" onClick={() => action('restore')} disabled={loading}>
          Restaurer la derniere sauvegarde
        </button>
      </div>

      {status && (
        <pre className={`data-status ${status.type}`}>
          {status.message}
        </pre>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update ProgressPage.jsx**

```jsx
import { useState, useEffect } from 'react';
import useProgress from '../hooks/useProgress';

const LEVEL_INFO = {
  1: { titre: 'Lecture basique', total: 6 },
  2: { titre: 'Filtres et operateurs', total: 8 },
  3: { titre: 'Modifications et index', total: 6 },
  4: { titre: 'Agregation', total: 7 },
  5: { titre: 'Pipelines complexes', total: 4 },
};

// Quiz ID to level mapping
const QUIZ_LEVELS = {};
[1,2,3,4,5,6].forEach(id => QUIZ_LEVELS[id] = 1);
[7,8,9,10,11,12,13,14].forEach(id => QUIZ_LEVELS[id] = 2);
[15,16,17,18,19,20].forEach(id => QUIZ_LEVELS[id] = 3);
[21,22,23,24,25,26,27].forEach(id => QUIZ_LEVELS[id] = 4);
[28,29,30,31].forEach(id => QUIZ_LEVELS[id] = 5);

export default function ProgressPage() {
  const { progress, reset } = useProgress();

  const levelStats = [1, 2, 3, 4, 5].map(niveau => {
    const completed = progress.completed.filter(id => QUIZ_LEVELS[id] === niveau).length;
    return { niveau, ...LEVEL_INFO[niveau], completed };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 style={{ marginBottom: 0 }}>Progression</h1>
        <button className="btn btn-small" onClick={() => { if (confirm('Reinitialiser toute la progression ?')) reset(); }}>
          Reinitialiser
        </button>
      </div>

      <div className="progress-stats" style={{ marginTop: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{progress.completed.length}</div>
          <div className="stat-label">Quiz reussis / 31</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.history.length}</div>
          <div className="stat-label">Tentatives totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {progress.history.length > 0
              ? Math.round((progress.history.filter(h => h.correct).length / progress.history.length) * 100)
              : 0}%
          </div>
          <div className="stat-label">Taux de reussite</div>
        </div>
      </div>

      <div className="progress-bar-container" style={{ height: 8, marginBottom: 32 }}>
        <div className="progress-bar-fill" style={{ width: `${(progress.completed.length / 31) * 100}%` }} />
      </div>

      <h2>Par niveau</h2>
      <div className="flex-col" style={{ gap: 12 }}>
        {levelStats.map(ls => (
          <div key={ls.niveau} className="card">
            <div className="flex items-center justify-between">
              <span>Niveau {ls.niveau} — {ls.titre}</span>
              <span style={{ fontSize: 13, color: ls.completed === ls.total ? 'var(--success)' : 'var(--text-secondary)' }}>
                {ls.completed}/{ls.total}
              </span>
            </div>
            <div className="progress-bar-container" style={{ marginTop: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${(ls.completed / ls.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {progress.history.length > 0 && (
        <div className="mt-24">
          <h2>Historique recent</h2>
          <div className="flex-col" style={{ gap: 4 }}>
            {progress.history.slice(-20).reverse().map((h, i) => (
              <div key={i} className="quiz-item">
                <span className="quiz-id" style={{ color: h.correct ? 'var(--success)' : 'var(--error)' }}>
                  {String(h.quizId).padStart(2, '0')}
                </span>
                <span className="quiz-text" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {new Date(h.timestamp).toLocaleString('fr-FR')}
                </span>
                <span className="quiz-badge" style={{ color: h.correct ? 'var(--success)' : 'var(--error)' }}>
                  {h.correct ? 'reussi' : 'echoue'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify all pages in browser**

- `/collections` — click a collection, see schema + samples
- `/data` — load data, export, backup
- `/progress` — see stats, reset

- [ ] **Step 5: Commit**

```bash
git add mongolingo/client/src/pages/
git commit -m "feat: add collections, data management, and progress pages"
```

---

### Task 13: Production Build + readme.txt

**Files:**
- Create: `mongolingo/readme.txt`
- Verify production build works

**Depends on:** All other tasks complete.

- [ ] **Step 1: Create readme.txt**

```
Mongolingo — Quiz MongoDB
=========================

Application web pour apprendre les requetes MongoDB,
dans l'univers de Cyberespar (IoT maritime breton).

Prerequis
---------
- Node.js 18+
- MongoDB 6+ (sur localhost:27017)
- mongodb-database-tools (pour mongodump/mongorestore)
  Installation Ubuntu: sudo apt install mongodb-database-tools

Installation
------------
cd mongolingo
npm run install:all

Demarrage (developpement)
--------------------------
npm start

Ouvre automatiquement :
- Client React : http://localhost:5173
- API Express  : http://localhost:3001

Premiere utilisation
--------------------
1. Ouvrir http://localhost:5173
2. Aller dans l'onglet "Donnees"
3. Cliquer sur "Charger les donnees de demo"
4. Revenir sur "Quiz" et commencer

Contenu
-------
- 31 questions reparties en 5 niveaux (QCM, remplissage, saisie libre)
- 5 collections MongoDB (clients, projets, employes, appareils_iot, mesures_iot)
- Schemas JSON dans schemas/
- Donnees de demo dans data/
- Export JSON/BSON et systeme de sauvegarde

Demonstration video
-------------------
[lien a ajouter]
```

- [ ] **Step 2: Verify production build**

```bash
cd mongolingo/client && npm run build
```
Expected: `client/dist/` directory created.

- [ ] **Step 3: Test production mode**

```bash
cd mongolingo && NODE_ENV=production node server/index.js
# Browse to http://localhost:3001
```

- [ ] **Step 4: Commit**

```bash
git add mongolingo/readme.txt
git commit -m "feat: add readme.txt with installation instructions"
```

---

## Post-Implementation Checklist

- [ ] All 31 quiz questions work (QCM, blancs, libre)
- [ ] Query execution rejects `drop`, `dropDatabase`, etc.
- [ ] Data load creates proper ObjectId references
- [ ] Collections page shows schemas and sample documents
- [ ] Export JSON/BSON downloads work
- [ ] Backup/restore cycle works
- [ ] Progression persists in localStorage
- [ ] Dark theme matches spec (zinc palette, violet accent, zero emoji)
- [ ] `npm start` at root launches both server and client
- [ ] Production build serves from Express
