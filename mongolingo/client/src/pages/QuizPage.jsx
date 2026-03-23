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

const LEVEL_TITLES = ['Lecture basique', 'Filtres et opérateurs', 'Modifications et index', 'Agrégation', 'Pipelines complexes'];

function QuizSidebar({ quizzes, currentQuizId, unlockedLevels, isCompleted, onSelectQuiz }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      overflowY: 'auto', padding: '16px 0',
      position: 'sticky', top: 48, maxHeight: 'calc(100vh - 48px)',
    }}>
      {LEVELS.map((niveau, i) => {
        const levelQuizzes = quizzes.filter(q => q.niveau === niveau).sort((a, b) => a.id - b.id);
        const locked = !unlockedLevels[i];
        return (
          <div key={niveau} style={{ marginBottom: 8, opacity: locked ? 0.4 : 1 }}>
            <div style={{ padding: '4px 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-tertiary)', marginBottom: 2 }}>
              N{niveau} — {LEVEL_TITLES[i]}
            </div>
            {locked ? (
              <div style={{ padding: '4px 16px', fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Verrouillé
              </div>
            ) : levelQuizzes.map(q => {
              const done = isCompleted(q.id);
              const active = q.id === currentQuizId;
              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuiz(q)}
                  style={{
                    padding: '5px 16px', cursor: 'pointer', fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    color: done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--text-tertiary)', minWidth: 16 }}>
                    {done ? '✓' : String(q.id).padStart(2, '0')}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{q.enonce}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      <div style={{ display: 'flex', margin: '0 -24px' }}>
        {sidebarOpen && (
          <QuizSidebar
            quizzes={quizzes}
            currentQuizId={currentQuiz.id}
            unlockedLevels={unlockedLevels}
            isCompleted={isCompleted}
            onSelectQuiz={setCurrentQuiz}
          />
        )}
        <div style={{ flex: 1, padding: '0 24px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <button
              className="btn btn-ghost btn-small"
              onClick={() => setSidebarOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              title={sidebarOpen ? 'Masquer la liste' : 'Afficher la liste des défis'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
              {sidebarOpen ? 'Masquer' : 'Liste des défis'}
            </button>
          </div>
          <QuizRunner
            key={currentQuiz.id}
            quiz={currentQuiz}
            onBack={() => setCurrentQuiz(null)}
            onComplete={markCompleted}
            nextQuiz={nextQuiz}
            onNext={handleNext}
          />
        </div>
      </div>
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
