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
