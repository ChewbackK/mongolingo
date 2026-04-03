import { useEffect, useMemo, useState } from 'react';
import useProgress from '../hooks/useProgress';

const LEVEL_TITLES = {
  1: 'Lecture basique',
  2: 'Filtres & opérateurs',
  3: 'Modifications & index',
  4: 'Agrégation',
  5: 'Pipelines complexes',
};

export default function ProgressPage() {
  const { progress, reset } = useProgress();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch('/api/quiz')
      .then(r => (r.ok ? r.json() : []))
      .then(setQuizzes)
      .catch(() => setQuizzes([]));
  }, []);

  const totalsByLevel = useMemo(
    () => quizzes.reduce((acc, q) => {
      acc[q.niveau] = (acc[q.niveau] || 0) + 1;
      return acc;
    }, {}),
    [quizzes]
  );

  const quizLevelById = useMemo(
    () => quizzes.reduce((acc, q) => {
      acc[q.id] = q.niveau;
      return acc;
    }, {}),
    [quizzes]
  );

  const completedByLevel = useMemo(
    () => progress.completed.reduce((acc, id) => {
      const niveau = quizLevelById[id];
      if (niveau) acc[niveau] = (acc[niveau] || 0) + 1;
      return acc;
    }, {}),
    [progress.completed, quizLevelById]
  );

  const total = quizzes.length || 50;
  const done = progress.completed.length;
  const attempts = progress.history.length;
  const successRate = attempts > 0
    ? Math.round((progress.history.filter(h => h.correct).length / attempts) * 100)
    : 0;

  const levelStats = [1, 2, 3, 4, 5].map(niveau => ({
    niveau,
    titre: LEVEL_TITLES[niveau],
    total: totalsByLevel[niveau] || 0,
    completed: completedByLevel[niveau] || 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 0 }}>Progression</h1>
        <button
          className="btn btn-small"
          onClick={() => { if (confirm('Réinitialiser toute la progression ?')) reset(); }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/>
          </svg>
          Réinitialiser
        </button>
      </div>

      {/* Stats */}
      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-value">{done}</div>
          <div className="stat-label">Quiz réussis / {total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{attempts}</div>
          <div className="stat-label">Tentatives totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{successRate}%</div>
          <div className="stat-label">Taux de réussite</div>
        </div>
      </div>

      {/* Global progress */}
      <div style={{ marginBottom: 36 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Progression globale
          </span>
          <span style={{ fontSize: 12, color: done === total ? 'var(--green)' : 'var(--text-secondary)', fontWeight: 600 }}>
            {Math.round((done / total) * 100)}%
          </span>
        </div>
        <div className="progress-bar-container" style={{ height: 7 }}>
          <div className="progress-bar-fill" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>

      {/* Per level */}
      <h2>Par niveau</h2>
      <div className="flex-col" style={{ gap: 10 }}>
        {levelStats.map(ls => {
          const pct = ls.total > 0 ? (ls.completed / ls.total) * 100 : 0;
          const isComplete = ls.completed === ls.total;
          return (
            <div key={ls.niveau} className="card" style={{ padding: '16px 20px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <div className="flex items-center" style={{ gap: 10 }}>
                  <span style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 800,
                    fontSize: 20,
                    color: isComplete ? 'var(--green)' : 'var(--text-tertiary)',
                    minWidth: 26,
                    letterSpacing: '-1px',
                  }}>
                    {String(ls.niveau).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {ls.titre}
                  </span>
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isComplete ? 'var(--green)' : 'var(--text-secondary)',
                }}>
                  {ls.completed}/{ls.total}
                </span>
              </div>
              <div className="progress-bar-container" style={{ margin: 0, height: 4 }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* History */}
      {progress.history.length > 0 && (
        <div className="mt-24">
          <h2>Historique récent</h2>
          <div className="flex-col" style={{ gap: 3 }}>
            {progress.history.slice(-20).reverse().map((h, i) => (
              <div key={i} className="quiz-item">
                <span className="quiz-id" style={{ color: h.correct ? 'var(--green)' : 'var(--error)' }}>
                  {String(h.quizId).padStart(2, '0')}
                </span>
                <span className="quiz-text" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {new Date(h.timestamp).toLocaleString('fr-FR')}
                </span>
                <span className="quiz-badge" style={{
                  color: h.correct ? 'var(--green)' : 'var(--error)',
                  borderColor: h.correct ? 'rgba(0,237,100,0.2)' : 'rgba(255,68,85,0.2)',
                  background: h.correct ? 'var(--green-dim)' : 'var(--error-dim)',
                }}>
                  {h.correct ? 'réussi' : 'échoué'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
