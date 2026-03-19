const LEVELS = [
  { niveau: 1, titre: 'Lecture basique', desc: 'find, findOne, sort, limit, countDocuments' },
  { niveau: 2, titre: 'Filtres et operateurs', desc: '$gt, $in, $all, $exists, $regex, dot notation' },
  { niveau: 3, titre: 'Modifications et index', desc: '$set, $inc, $addToSet, deleteMany, createIndex, upsert' },
  { niveau: 4, titre: 'Agregation', desc: '$group, $lookup, $unwind, $bucket, $project' },
  { niveau: 5, titre: 'Pipelines complexes', desc: '$facet, multi-lookup, explain' },
];

export default function LevelSelect({ quizzes, onSelectQuiz, isCompleted }) {
  return (
    <div className="level-grid">
      {LEVELS.map(level => {
        const levelQuizzes = quizzes.filter(q => q.niveau === level.niveau);
        const completedCount = levelQuizzes.filter(q => isCompleted(q.id)).length;
        return (
          <div key={level.niveau} className="level-group">
            <div className="flex items-center justify-between">
              <h2>Niveau {level.niveau} — {level.titre}</h2>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {completedCount}/{levelQuizzes.length}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>{level.desc}</p>
            <div className="quiz-list">
              {levelQuizzes.map(q => (
                <div
                  key={q.id}
                  className={`quiz-item ${isCompleted(q.id) ? 'completed' : ''}`}
                  onClick={() => onSelectQuiz(q)}
                >
                  <span className="quiz-id">{String(q.id).padStart(2, '0')}</span>
                  <span className="quiz-text">{q.enonce}</span>
                  <span className="quiz-badge">{q.mode}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
