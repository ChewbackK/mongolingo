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
