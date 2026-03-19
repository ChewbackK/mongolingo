const { Router } = require('express');
const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error('Non connecte');
    await db.admin().ping();
    res.json({ status: 'connected', db: db.databaseName });
  } catch (err) {
    res.status(503).json({ status: 'disconnected', error: err.message });
  }
});

module.exports = router;
