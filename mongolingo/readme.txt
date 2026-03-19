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
