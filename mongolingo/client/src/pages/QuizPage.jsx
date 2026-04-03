import { useState, useEffect, useMemo, useCallback } from 'react';
import LevelSelect from '../components/Quiz/LevelSelect';
import QuizRunner from '../components/Quiz/QuizRunner';
import useProgress from '../hooks/useProgress';

const LEVELS = [1, 2, 3, 4, 5];

function computeUnlockedLevels(quizzes, isCompleted, isLessonCompleted) {
  return LEVELS.map((niveau, i) => {
    // La leçon courante doit toujours être complétée
    if (!isLessonCompleted(niveau)) return false;
    
    // Pour le niveau 1, seule la leçon 1 compte
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
    .sort((a, b) => (a.niveau - b.niveau) || (a.id - b.id));
  const idx = accessible.findIndex(q => q.id === currentQuiz.id);
  if (idx === -1 || idx === accessible.length - 1) return null;
  return accessible[idx + 1];
}

const LEVEL_TITLES = [
  'Lecture basique',
  'Filtres & opérateurs',
  'Modifications & index',
  'Agrégation',
  'Pipelines complexes',
];

function CollectionsPanel() {
  const [collections, setCollections] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState({});

  useEffect(() => {
    fetch('/api/collections')
      .then(r => r.ok ? r.json() : [])
      .then(setCollections)
      .catch(() => {});
  }, []);

  const toggle = async (name) => {
    if (expanded === name) { setExpanded(null); return; }
    setExpanded(name);
    if (!detail[name]) {
      try {
        const [schema, sample] = await Promise.all([
          fetch(`/api/collections/${name}/schema`).then(r => r.json()),
          fetch(`/api/collections/${name}/sample`).then(r => r.json()),
        ]);
        setDetail(d => ({ ...d, [name]: { schema, sample } }));
      } catch {}
    }
  };

  return (
    <div style={{
      width: 272, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border)',
      overflowY: 'auto',
      padding: '16px 0',
      position: 'sticky',
      top: 'var(--topbar-height)',
      maxHeight: 'calc(100vh - var(--topbar-height))',
    }}>
      <div style={{
        padding: '0 16px 10px',
        fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.8px',
        color: 'var(--text-tertiary)',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        Collections
      </div>

      {collections.length === 0 && (
        <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--text-tertiary)' }}>
          MongoDB non disponible
        </div>
      )}

      {collections.map(c => (
        <div key={c.name}>
          <div
            onClick={() => toggle(c.name)}
            style={{
              padding: '7px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: expanded === c.name ? 'var(--bg-elevated)' : 'transparent',
              borderLeft: expanded === c.name ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'background 0.1s',
            }}
          >
            <span style={{
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: expanded === c.name ? 'var(--green)' : 'var(--text-primary)',
            }}>
              {c.name}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.count}</span>
          </div>

          {expanded === c.name && detail[c.name] && (
            <div style={{ padding: '8px 16px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-tertiary)', marginBottom: 6 }}>
                Champs
              </div>
              {detail[c.name].schema?.properties && Object.entries(detail[c.name].schema.properties).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, fontSize: 11, marginBottom: 3, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--green)', minWidth: 90, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: 'var(--amber)', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{v.type}</span>
                </div>
              ))}
              {detail[c.name].sample?.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-tertiary)', margin: '10px 0 6px' }}>
                    Exemple
                  </div>
                  <pre style={{
                    fontSize: 10, color: 'var(--blue)',
                    background: 'var(--bg-void)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '8px', overflowX: 'auto',
                    lineHeight: 1.5, margin: 0, maxHeight: 200, overflowY: 'auto',
                  }}>
                    {JSON.stringify(detail[c.name].sample[0], null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function QuizSidebar({ quizzes, currentQuizId, unlockedLevels, isCompleted, onSelectQuiz }) {
  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      overflowY: 'auto', padding: '12px 0',
      position: 'sticky',
      top: 'var(--topbar-height)',
      maxHeight: 'calc(100vh - var(--topbar-height))',
    }}>
      {LEVELS.map((niveau, i) => {
        const levelQuizzes = quizzes.filter(q => q.niveau === niveau).sort((a, b) => a.id - b.id);
        const locked = !unlockedLevels[i];
        return (
          <div key={niveau} style={{ marginBottom: 4, opacity: locked ? 0.35 : 1 }}>
            <div style={{
              padding: '4px 16px',
              fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.8px',
              color: 'var(--text-tertiary)', marginBottom: 2,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              N{niveau} — {LEVEL_TITLES[i]}
            </div>
            {locked ? (
              <div style={{ padding: '3px 16px', fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
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
                    background: active ? 'var(--green-dim)' : 'transparent',
                    borderLeft: active ? '2px solid var(--green)' : '2px solid transparent',
                    color: done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                    color: done ? 'var(--green)' : active ? 'var(--green)' : 'var(--text-tertiary)',
                    minWidth: 16,
                  }}>
                    {done ? '✓' : String(q.id).padStart(2, '0')}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontSize: 11 }}>
                    {q.enonce}
                  </span>
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
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const { progress, markCompleted, isCompleted, isLessonCompleted } = useProgress();

  useEffect(() => {
    fetch('/api/quiz').then(r => r.json()).then(setQuizzes).catch(() => {});
  }, []);

  const unlockedLevels = useMemo(
    () => computeUnlockedLevels(quizzes, isCompleted, isLessonCompleted),
    [quizzes, isCompleted, isLessonCompleted]
  );

  const resumeQuiz = useMemo(
    () => findResumeQuiz(quizzes, unlockedLevels, isCompleted),
    [quizzes, unlockedLevels, isCompleted]
  );

  const nextQuiz = useMemo(
    () => currentQuiz ? computeNextQuiz(quizzes, currentQuiz, unlockedLevels) : null,
    [quizzes, currentQuiz, unlockedLevels]
  );

  const handleNext = useCallback(() => setCurrentQuiz(nextQuiz), [nextQuiz]);

  /* ── Active quiz view ── */
  if (currentQuiz) {
    return (
      <div style={{ display: 'flex', margin: '0 -28px' }}>
        {sidebarOpen && (
          <QuizSidebar
            quizzes={quizzes}
            currentQuizId={currentQuiz.id}
            unlockedLevels={unlockedLevels}
            isCompleted={isCompleted}
            onSelectQuiz={setCurrentQuiz}
          />
        )}

        <div style={{ flex: 1, padding: '28px', minWidth: 0, overflowY: 'auto' }}>
          {/* Toggle bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button
              className="btn btn-ghost btn-small"
              onClick={() => setSidebarOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              {sidebarOpen ? 'Masquer défis' : 'Liste des défis'}
            </button>
            <button
              className="btn btn-ghost btn-small"
              onClick={() => setCollectionsOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {collectionsOpen ? 'Masquer collections' : 'Collections'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
                <path d="M3 12a9 3 0 0 0 18 0"/>
              </svg>
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

        {collectionsOpen && <CollectionsPanel />}
      </div>
    );
  }

  /* ── Level select view ── */
  const total = quizzes.length || 50;
  const done = progress.completed.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <h1 style={{ marginBottom: 0 }}>Quiz MongoDB</h1>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
          {done} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/ {total}</span>
        </span>
      </div>

      {/* Global progress bar */}
      <div className="progress-bar-container" style={{ height: 4, marginBottom: 24 }}>
        <div className="progress-bar-fill" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      {/* Resume card */}
      {resumeQuiz && (
        <div className="resume-card" onClick={() => setCurrentQuiz(resumeQuiz)}>
          <div style={{ paddingLeft: 8 }}>
            <div className="resume-label">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12h15M13 6l6 6-6 6"/>
              </svg>
              Reprendre
            </div>
            <div className="resume-text">
              Défi #{String(resumeQuiz.id).padStart(2, '0')} — {resumeQuiz.enonce}
            </div>
          </div>
          <button
            className="btn btn-accent btn-small"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Continuer
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}

      <LevelSelect
        quizzes={quizzes}
        onSelectQuiz={setCurrentQuiz}
        isCompleted={isCompleted}
        unlockedLevels={unlockedLevels}
        isLessonCompleted={isLessonCompleted}
      />
    </div>
  );
}
