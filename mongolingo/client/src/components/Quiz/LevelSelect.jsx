import { Link } from 'react-router-dom';

const LEVELS = [
  { niveau: 1, titre: 'Lecture basique',        desc: 'find · findOne · sort · limit · countDocuments' },
  { niveau: 2, titre: 'Filtres & opérateurs',   desc: '$gt · $in · $all · $exists · $regex · dot notation' },
  { niveau: 3, titre: 'Modifications & index',  desc: '$set · $inc · $addToSet · deleteMany · createIndex' },
  { niveau: 4, titre: 'Agrégation',             desc: '$group · $lookup · $unwind · $bucket · $project' },
  { niveau: 5, titre: 'Pipelines complexes',    desc: '$facet · multi-lookup · explain' },
];

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

export default function LevelSelect({ quizzes, onSelectQuiz, isCompleted, unlockedLevels, isLessonCompleted }) {
  return (
    <div className="level-grid">
      {LEVELS.map((level, i) => {
        const levelQuizzes = quizzes.filter(q => q.niveau === level.niveau);
        const completedCount = levelQuizzes.filter(q => isCompleted(q.id)).length;
        const isLocked = !unlockedLevels[i];
        const ratio = levelQuizzes.length === 0 ? 0 : completedCount / levelQuizzes.length;
        const isComplete = levelQuizzes.length > 0 && completedCount === levelQuizzes.length;
        
        // Calculs pour les prérequis du niveau précédent
        const prevLevelQuizzes = i > 0 ? quizzes.filter(q => q.niveau === level.niveau - 1) : [];
        const prevCompletedCount = prevLevelQuizzes.filter(q => isCompleted(q.id)).length;
        const neededToUnlock = i > 0 ? Math.ceil(prevLevelQuizzes.length * 0.8) : 0;
        const prevLevelUnlocked = i === 0 || prevCompletedCount >= neededToUnlock;

        const lessonCompleted = isLessonCompleted(level.niveau);

        return (
          <div key={level.niveau} className={`level-card ${isLocked ? 'locked' : ''}`}>
            <div className="level-card-header">
              <span className="level-number">
                {String(level.niveau).padStart(2, '0')}
              </span>
              <div className="level-card-info">
                <div className="level-title">
                  {level.titre}
                  <Link 
                    to="/lessons"
                    style={{
                      marginLeft: '8px',
                      fontSize: '0.75rem',
                      background: 'var(--green-dim)',
                      color: 'var(--green)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      pointerEvents: 'auto',
                      border: '1px solid var(--green)'
                    }}
                  >
                    📖 {lessonCompleted ? 'Réviser la leçon' : 'Leçon requise'}
                  </Link>
                </div>
                <div className="level-desc">{level.desc}</div>
              </div>
              <span className={`level-count ${isComplete ? 'complete' : ''}`}>
                {isComplete ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)' }}>
                    <CheckIcon /> Terminé
                  </span>
                ) : (
                  `${completedCount} / ${levelQuizzes.length}`
                )}
              </span>
            </div>

            <div className="level-progress-bar">
              <div className="level-progress-fill" style={{ width: `${ratio * 100}%` }} />
            </div>

            {isLocked ? (
              <div className="locked-message" style={{ display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto' }}>
                {!lessonCompleted && (
                  <div>
                    <LockIcon />
                    Lisez la <Link to="/lessons" style={{ textDecoration: 'underline', color: 'inherit', pointerEvents: 'auto' }}>Leçon {level.niveau}</Link> pour débloquer
                  </div>
                )}
                {!prevLevelUnlocked && (
                  <div>
                    <LockIcon />
                    Complétez {neededToUnlock} / {prevLevelQuizzes.length} défis du niveau {level.niveau - 1} pour débloquer
                  </div>
                )}
              </div>
            ) : (
              <div className="quiz-list">
                {levelQuizzes.map(q => (
                  <div
                    key={q.id}
                    className={`quiz-item ${isCompleted(q.id) ? 'completed' : ''}`}
                    onClick={() => onSelectQuiz(q)}
                  >
                    <span className="quiz-id">
                      {isCompleted(q.id) ? <CheckIcon /> : String(q.id).padStart(2, '0')}
                    </span>
                    <span className="quiz-text">{q.enonce}</span>
                    <span className="quiz-badge">{q.mode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
