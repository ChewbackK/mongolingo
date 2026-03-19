import useProgress from '../hooks/useProgress';

const LEVEL_INFO = {
  1: { titre: 'Lecture basique', total: 6 },
  2: { titre: 'Filtres et operateurs', total: 8 },
  3: { titre: 'Modifications et index', total: 6 },
  4: { titre: 'Agregation', total: 7 },
  5: { titre: 'Pipelines complexes', total: 4 },
};

// Quiz ID to level mapping
const QUIZ_LEVELS = {};
[1,2,3,4,5,6].forEach(id => QUIZ_LEVELS[id] = 1);
[7,8,9,10,11,12,13,14].forEach(id => QUIZ_LEVELS[id] = 2);
[15,16,17,18,19,20].forEach(id => QUIZ_LEVELS[id] = 3);
[21,22,23,24,25,26,27].forEach(id => QUIZ_LEVELS[id] = 4);
[28,29,30,31].forEach(id => QUIZ_LEVELS[id] = 5);

export default function ProgressPage() {
  const { progress, reset } = useProgress();

  const levelStats = [1, 2, 3, 4, 5].map(niveau => {
    const completed = progress.completed.filter(id => QUIZ_LEVELS[id] === niveau).length;
    return { niveau, ...LEVEL_INFO[niveau], completed };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 style={{ marginBottom: 0 }}>Progression</h1>
        <button className="btn btn-small" onClick={() => { if (confirm('Reinitialiser toute la progression ?')) reset(); }}>
          Reinitialiser
        </button>
      </div>

      <div className="progress-stats" style={{ marginTop: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{progress.completed.length}</div>
          <div className="stat-label">Quiz reussis / 31</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.history.length}</div>
          <div className="stat-label">Tentatives totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {progress.history.length > 0
              ? Math.round((progress.history.filter(h => h.correct).length / progress.history.length) * 100)
              : 0}%
          </div>
          <div className="stat-label">Taux de reussite</div>
        </div>
      </div>

      <div className="progress-bar-container" style={{ height: 8, marginBottom: 32 }}>
        <div className="progress-bar-fill" style={{ width: `${(progress.completed.length / 31) * 100}%` }} />
      </div>

      <h2>Par niveau</h2>
      <div className="flex-col" style={{ gap: 12 }}>
        {levelStats.map(ls => (
          <div key={ls.niveau} className="card">
            <div className="flex items-center justify-between">
              <span>Niveau {ls.niveau} — {ls.titre}</span>
              <span style={{ fontSize: 13, color: ls.completed === ls.total ? 'var(--success)' : 'var(--text-secondary)' }}>
                {ls.completed}/{ls.total}
              </span>
            </div>
            <div className="progress-bar-container" style={{ marginTop: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${(ls.completed / ls.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {progress.history.length > 0 && (
        <div className="mt-24">
          <h2>Historique recent</h2>
          <div className="flex-col" style={{ gap: 4 }}>
            {progress.history.slice(-20).reverse().map((h, i) => (
              <div key={i} className="quiz-item">
                <span className="quiz-id" style={{ color: h.correct ? 'var(--success)' : 'var(--error)' }}>
                  {String(h.quizId).padStart(2, '0')}
                </span>
                <span className="quiz-text" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {new Date(h.timestamp).toLocaleString('fr-FR')}
                </span>
                <span className="quiz-badge" style={{ color: h.correct ? 'var(--success)' : 'var(--error)' }}>
                  {h.correct ? 'reussi' : 'echoue'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
