# Trame video de demonstration (2 min max) - Mongolingo

## Objectif
Montrer rapidement que le projet couvre toutes les exigences du sujet R403:
- application React
- au moins 30 requetes MongoDB progressives
- solutions expliquees et executees
- collections et schemas presentes
- chargement/export/sauvegarde JSON/BSON
- installation documentee

## Preparation avant enregistrement
1. Ouvrir un terminal dans le dossier `mongolingo`.
2. Lancer la stack:

```bash
docker compose up --build -d
```

3. Ouvrir l'application sur http://localhost:5173.
4. Garder un terminal pret pour montrer l'arborescence si necessaire.

## Script minute par minute

### 00:00 - 00:10 : Introduction
Dire:
"Mongolingo est une application web React pour apprendre MongoDB avec une progression de difficultes, inspiree d'une logique de quiz type Duolingo."

Montrer:
- la page d'accueil Quiz
- la navigation generale

### 00:10 - 00:25 : Installation et rendu
Dire:
"Le projet est installe facilement sur Ubuntu recente, et le readme.txt contient les etapes de lancement ainsi que le lien de video de demonstration."

Montrer:
- `readme.txt`
- les commandes principales d'installation et de lancement

### 00:25 - 00:38 : Structure de rendu demandee
Dire:
"Le rendu contient le code sans node_modules, les schemas, les donnees de demo et un dossier de sauvegarde."

Montrer rapidement l'arborescence:
- `mongolingo/schemas/`
- `mongolingo/data/`
- `mongolingo/backup/`

### 00:38 - 00:55 : Collections et schemas
Dire:
"L'utilisateur peut comprendre la construction des collections: schema, champs, types, et exemples de documents."

Montrer:
- onglet Collections
- selection d'une collection
- schema + exemple JSON

### 00:55 - 01:15 : Chargement, export, sauvegarde
Dire:
"On peut charger les donnees de demonstration, exporter en JSON et BSON, creer une sauvegarde et la restaurer."

Montrer dans Donnees:
1. Charger les donnees de demo
2. Export JSON
3. Export BSON
4. Creer une sauvegarde
5. Restaurer la derniere sauvegarde

### 01:15 - 01:35 : Quiz et progression pedagogique
Dire:
"Le projet contient 50 quiz, soit 10 par niveau sur 5 niveaux, avec progression pedagogique du simple vers le complexe."

Montrer:
- page Quiz avec niveaux
- compteurs de progression
- mecanisme de debloquage

### 01:35 - 01:52 : Execution reelle des solutions
Dire:
"Chaque quiz a une solution expliquee, et la requete est executee sur la base pour afficher le resultat reel."

Montrer sur un quiz:
- enonce
- bouton Indice
- bouton Solution
- requete MongoDB
- explication
- resultat reel execute

### 01:52 - 02:00 : Conclusion
Dire:
"Le cahier des charges est respecte: React, progression, plus de 30 requetes, execution reelle, schemas et collections, chargement/sauvegarde JSON-BSON, et installation documentee."

## Checklist orale (a citer explicitement)
- Application React nommee Mongolingo.
- 50 requetes MongoDB progressives (>= 30).
- Solutions expliquees et executees sur la base.
- Construction des collections et schemas visibles.
- Chargement de donnees + export/sauvegarde JSON/BSON.
- Installation expliquee dans `readme.txt`.

## Astuce pour la version finale
Dans `readme.txt`, remplacer la section video placeholder par le lien final (YouTube non repertorie ou equivalent).