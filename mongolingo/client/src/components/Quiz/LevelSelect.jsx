const LEVELS = [
  { niveau: 1, titre: 'Lecture basique', desc: 'find, findOne, sort, limit, countDocuments' },
  { niveau: 2, titre: 'Filtres et operateurs', desc: '$gt, $in, $all, $exists, $regex, dot notation' },
  { niveau: 3, titre: 'Modifications et index', desc: '$set, $inc, $addToSet, deleteMany, createIndex, upsert' },
  { niveau: 4, titre: 'Agregation', desc: '$group, $lookup, $unwind, $bucket, $project' },
  { niveau: 5, titre: 'Pipelines complexes', desc: '$facet, multi-lookup, explain' },
];

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function LevelSelect({ quizzes, onSelectQuiz, isCompleted, unlockedLevels }) {
  return (
    <div className="level-grid">
      {LEVELS.map((level, i) => {
        const levelQuizzes = quizzes.filter(q => q.niveau === level.niveau);
        const completedCount = levelQuizzes.filter(q => isCompleted(q.id)).length;
        const isLocked = !unlockedLevels[i];
        const ratio = levelQuizzes.length === 0 ? 0 : completedCount / levelQuizzes.length;
        const prevLevelQuizzes = quizzes.filter(q => q.niveau === level.niveau - 1);
        const neededToUnlock = Math.ceil(prevLevelQuizzes.length * 0.8);

        return (
          <div key={level.niveau} className="level-group" style={isLocked ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <div className="flex items-center" style={{ gap: 7 }}>
                {isLocked && <LockIcon />}
                <h2 style={{ marginBottom: 0 }}>Niveau {level.niveau} — {level.titre}</h2>
              </div>
              <span style={{ fontSize: 12, color: completedCount === levelQuizzes.length && levelQuizzes.length > 0 ? 'var(--success)' : 'var(--text-tertiary)' }}>
                {completedCount}/{levelQuizzes.length}
              </span>
            </div>

            <div className="progress-bar-container" style={{ height: 3, marginBottom: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${ratio * 100}%` }} />
            </div>

            {isLocked ? (
              <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', color: 'var(--text-tertiary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Complétez {neededToUnlock}/{prevLevelQuizzes.length} défis du niveau {level.niveau - 1} pour débloquer
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>{level.desc}</p>
                <div className="quiz-list">
                  {levelQuizzes.map(q => (
                    <div
                      key={q.id}
                      className={`quiz-item ${isCompleted(q.id) ? 'completed' : ''}`}
                      onClick={() => onSelectQuiz(q)}
                    >
                      <span className="quiz-id" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isCompleted(q.id) ? <CheckIcon /> : String(q.id).padStart(2, '0')}
                      </span>
                      <span className="quiz-text">{q.enonce}</span>
                      <span className="quiz-badge">{q.mode}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
