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
