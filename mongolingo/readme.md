Mongolingo — Quiz MongoDB
=========================

Application web pour apprendre les requetes MongoDB,
dans l'univers de Cyberespar (IoT maritime breton).

Prerequis (mode local)
----------------------
- Node.js 18+
- MongoDB 6+ (sur localhost:27017)
- mongodb-database-tools (pour mongodump/mongorestore)
  Installation Ubuntu: sudo apt install mongodb-database-tools

Installation
------------
1. Assurez-vous d'avoir installé Node.js et MongoDB (voir la section Prérequis).
2. Démarrez le service MongoDB s'il n'est pas déjà en cours d'exécution :
   `sudo systemctl start mongod` (sur Linux/Ubuntu).
3. Ouvrez un terminal et placez-vous dans le dossier principal du projet :
   `cd mongolingo`
4. Installez toutes les dépendances (pour l'API et le client React) avec la commande suivante :
   `npm run install:all`

Demarrage local (developpement)
--------------------------------
npm start

Ouvre automatiquement :
- Client React : http://localhost:5173
- API Express  : http://localhost:3001

Avec Docker (recommande)
-----------------------------------
Prerequis :
- Docker
- Docker Compose (plugin docker compose)

Lancement :
1. Placez-vous dans le dossier du projet :
   `cd mongolingo`
2. Construisez et lancez les conteneurs :
   `docker compose up --build -d`
3. Si le port 5173 est deja occupe, vous pouvez forcer un autre port hote :
   `APP_PORT=5175 docker compose up --build -d`

Acces :
- Application (React + API via Express) : http://localhost:5173
- MongoDB (optionnel, pour debug externe) : mongodb://localhost:27017

Arret :
- `docker compose down`

Arret + suppression des donnees Mongo (reset complet) :
- `docker compose down -v`

Logs utiles :
- Application : `docker compose logs -f app`
- MongoDB : `docker compose logs -f mongo`

Fonctions BSON en Docker :
- Les routes `export/bson`, `backup` et `restore` sont conservees.
- Les outils `mongodump` et `mongorestore` sont inclus dans l'image applicative.
- Les sauvegardes sont persistees dans le dossier `backup/` du projet.

Premiere utilisation
--------------------
1. Ouvrir http://localhost:5173
2. Aller dans l'onglet "Donnees"
3. Cliquer sur "Charger les donnees de demo"
4. Revenir sur "Quiz" et commencer

Contenu
-------
- 50 questions reparties en 5 niveaux progressifs (10 quiz par niveau)
- 5 collections MongoDB (clients, projets, employes, appareils_iot, mesures_iot)
- Schemas JSON dans schemas/
- Donnees de demo dans data/
- Export JSON/BSON et systeme de sauvegarde
- Progression pedagogique (condensee) :
   - Niveau 1 (10 quiz) : lecture basique (find, findOne, projection, sort, limit, countDocuments)
   - Niveau 2 (10 quiz) : filtres et operateurs ($gt, $in, $all, dot notation)
   - Niveau 3 (10 quiz) : modifications et index (insert, update avec $set/$push/$pull, delete, createIndex)
   - Niveau 4 (10 quiz) : aggregation de base ($match, $group, $sum/$avg, $project)
   - Niveau 5 (10 quiz) : pipelines avances ($lookup, $unwind)
   - Accompagnement utilisateur : niveaux 1-2 guides (QCM + textes a trous), niveau 3 en transition, niveaux 4-5 majoritairement en saisie libre

Demonstration video
-------------------
vIDÉO Pas encore faite