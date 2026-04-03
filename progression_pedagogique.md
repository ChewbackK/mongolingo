# Progression Pédagogique - Mongolingo

Ce document détaille la démarche employée pour structurer la progression des niveaux et la difficulté des questions, répondant ainsi à la consigne d'éviter l'abus d'IA et de concevoir un système pédagogique adapté.

La progression est architecturée autour de deux axes principaux : **la complexité NoSQL (le fond)** et **l'assistance utilisateur (la forme/les mécaniques de jeu)**.

## 1. Une progression technique en 5 paliers (Logique métier)
Le fichier de données démontre une courbe d'apprentissage qui suit scrupuleusement la difficulté du langage MongoDB (50 questions au total, 10 par niveau) :

* **Niveau 1 : Lecture basique (10 questions)**
  * *Objectif :* Appréhender l'interface et la syntaxe de base.
  * *Concepts :* Découverte de `find()`, `findOne()`, le système de projection (inclure/exclure des champs), le comptage pur (`countDocuments()`) ainsi que les tris (`sort`) et limites (`limit`).

* **Niveau 2 : Filtres & Opérateurs (10 questions)**
  * *Objectif :* Affiner les recherches (le cœur du métier NoSQL).
  * *Concepts :* Utilisation des opérateurs de comparaison (`$gt`), logiques (`$in`, le ET implicite), la recherche dans des tableaux (valeur simple et `$all`), et la notation pointée *(dot notation)* pour les sous-documents.

* **Niveau 3 : Modifications & Index (10 questions)**
  * *Objectif :* Transformer les données.
  * *Concepts :* L'insertion (`insertOne`), la mise à jour complexe avec `$set` ou sur des tableaux (opérateurs `$push` et `$pull`), la suppression, ainsi que des notions d'optimisation comme `createIndex()`.

* **Niveau 4 : Agrégation – Les bases (10 questions)**
  * *Objectif :* Traitement groupé et statistiques.
  * *Concepts :* Introduction du pipeline d'agrégation, les filtres de pipeline (`$match`), le regroupement (`$group`) et les opérations d'accumulation mathématiques (`$sum`, `$avg`). Refaçonnage avec `$project`.

* **Niveau 5 : Pipelines complexes (10 questions)**
  * *Objectif :* Requêtage avancé propre aux BDD relationnelles vs documentaires.
  * *Concepts :* Les "Jointures" entre collections avec `$lookup` et "l'aplatissement" de tableaux avec `$unwind`.

## 2. Une progression de l'assistance (Mécaniques de Jeu)
Ce qui rend la progression similaire au principe de Duolingo, c'est le type des questions (`mode`) appliqué dans chaque niveau :

* **Niveaux 1 et 2 (L'échauffement) :** 
  L'utilisateur est extrêmement guidé. Toutes les interactions se font via des **QCM** ou des **textes à trous**. Il ne code quasiment pas, il apprend à identifier et assimiler la bonne syntaxe visuellement.

* **Niveau 3 (La transition) :** 
  L'assistance commence à être retirée. Le niveau mêle des QCM/textes à trous pour les nouveautés, mais introduit la **saisie libre** pour vérifier les acquis ou pour forcer l'utilisateur à créer une requête de modification (`update` / `insert`) de lui-même.

* **Niveaux 4 et 5 (Le challenge total) :** 
  L'utilisateur est désormais seul face au shell. On passe sur une majorité ou une totalité de **saisies libres**. Pour le niveau d'agrégation complexe, l'utilisateur a compris la philosophie des accolades et crochets, l'application lui demande de formuler l'intégralité de son pipeline.
