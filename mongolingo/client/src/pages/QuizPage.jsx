import { useState, useEffect, useMemo, useCallback } from 'react';
import LevelSelect from '../components/Quiz/LevelSelect';
import QuizRunner from '../components/Quiz/QuizRunner';
import useProgress from '../hooks/useProgress';

const LEVELS = [1, 2, 3, 4, 5];

function computeUnlockedLevels(quizzes, isCompleted) {
  return LEVELS.map((niveau, i) => {
    if (i === 0) return true;
    const prevLevel = LEVELS[i - 1];
    const prevQuizzes = quizzes.filter(q => q.niveau === prevLevel);
    const prevCompleted = prevQuizzes.filter(q => isCompleted(q.id)).length;
    const ratio = prevQuizzes.length === 0 ? 0 : prevCompleted / prevQuizzes.length;
    return ratio >= 0.8;
  });
}

function findResumeQuiz(quizzes, unlockedLevels, isCompleted) {
  for (let i = unlockedLevels.length - 1; i >= 0; i--) {
    if (!unlockedLevels[i]) continue;
    const niveau = i + 1;
    const levelQuizzes = quizzes.filter(q => q.niveau === niveau).sort((a, b) => a.id - b.id);
    const firstIncomplete = levelQuizzes.find(q => !isCompleted(q.id));
    if (firstIncomplete) return firstIncomplete;
  }
  return null;
}

function computeNextQuiz(quizzes, currentQuiz, unlockedLevels) {
  const accessible = quizzes
    .filter(q => unlockedLevels[q.niveau - 1])
    .sort((a, b) => a.id - b.id);
  const idx = accessible.findIndex(q => q.id === currentQuiz.id);
  if (idx === -1 || idx === accessible.length - 1) return null;
  return accessible[idx + 1];
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const { progress, markCompleted, isCompleted } = useProgress();

  useEffect(() => {
    fetch('/api/quiz').then(r => r.json()).then(setQuizzes).catch(() => {});
  }, []);

  const unlockedLevels = useMemo(
    () => computeUnlockedLevels(quizzes, isCompleted),
    [quizzes, isCompleted]
  );

  const resumeQuiz = useMemo(
    () => findResumeQuiz(quizzes, unlockedLevels, isCompleted),
    [quizzes, unlockedLevels, isCompleted]
  );

  const nextQuiz = useMemo(
    () => currentQuiz ? computeNextQuiz(quizzes, currentQuiz, unlockedLevels) : null,
    [quizzes, currentQuiz, unlockedLevels]
  );
  const handleNext = useCallback(
    () => setCurrentQuiz(nextQuiz),
    [nextQuiz]
  );

  if (currentQuiz) {
    return (
      <QuizRunner
        key={currentQuiz.id}
        quiz={currentQuiz}
        onBack={() => setCurrentQuiz(null)}
        onComplete={markCompleted}
        nextQuiz={nextQuiz}
        onNext={handleNext}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <h1 style={{ marginBottom: 0 }}>Quiz MongoDB</h1>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {progress.completed.length}/{quizzes.length || 31}
        </span>
      </div>
      <div className="progress-bar-container" style={{ marginBottom: 20 }}>
        <div className="progress-bar-fill" style={{ width: `${(progress.completed.length / (quizzes.length || 31)) * 100}%` }} />
      </div>

      {resumeQuiz && (
        <div
          onClick={() => setCurrentQuiz(resumeQuiz)}
          style={{
            background: 'var(--accent-dim)',
            border: '1px solid rgba(129,140,248,0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h15M13 6l6 6-6 6"/></svg>
              Reprendre
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>
              Défi #{String(resumeQuiz.id).padStart(2, '0')} — {resumeQuiz.enonce}
            </div>
          </div>
          <button className="btn btn-accent" style={{ fontSize: 12, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            Continuer
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}

      <LevelSelect
        quizzes={quizzes}
        onSelectQuiz={setCurrentQuiz}
        isCompleted={isCompleted}
        unlockedLevels={unlockedLevels}
      />
    </div>
  );
}
