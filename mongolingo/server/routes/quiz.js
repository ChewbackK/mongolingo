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
