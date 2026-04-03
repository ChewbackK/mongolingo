import { useState, useEffect } from 'react';
import QCM from './QCM';
import FillBlanks from './FillBlanks';
import FreeInput from './FreeInput';

export default function QuizRunner({ quiz, onBack, onComplete, nextQuiz, onNext }) {
  const [fullQuiz, setFullQuiz] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionResult, setSolutionResult] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [hintText, setHintText] = useState(null);

  useEffect(() => {
    fetch(`/api/quiz/${quiz.id}`)
      .then(r => r.json())
      .then(setFullQuiz)
      .catch(() => {});
  }, [quiz.id]);

  if (!fullQuiz) return <div className="loading">Chargement</div>;

  const handleResult = (correct, answer) => {
    setAnswered(true);
    onComplete(quiz.id, answer, correct);
  };

  const handleRevealSolution = async () => {
    setShowSolution(true);
    if (fullQuiz.solution.auto_execute_on_reveal) {
      try {
        const res = await fetch(`/api/quiz/${quiz.id}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: fullQuiz.solution.query }),
        });
        const data = await res.json();
        if (data.success) setSolutionResult(data.data);
      } catch {}
    }
  };

  const handleGetHint = async () => {
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/hint`);
      const data = await res.json();
      setHintText(data.hint);
    } catch {}
  };

  const ModeComponent = { qcm: QCM, blancs: FillBlanks, libre: FreeInput }[fullQuiz.mode];

  return (
    <div>
      {/* Tags */}
      <div className="quiz-header">
        <span className="quiz-level">Niveau {fullQuiz.niveau}</span>
        <span className="quiz-mode">{fullQuiz.mode}</span>
        <span className="quiz-mode">{fullQuiz.collection}</span>
      </div>

      <h2 className="quiz-enonce">{fullQuiz.enonce}</h2>

      <ModeComponent quiz={fullQuiz} onResult={handleResult} />

      {/* Hint */}
      {hintText && (
        <div className="mt-16" style={{
          padding: '12px 16px',
          background: 'var(--amber-dim)',
          border: '1px solid rgba(255,176,32,0.2)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 13,
          color: 'var(--amber)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {hintText}
        </div>
      )}

      {/* Action bar */}
      <div className="flex gap-8 mt-24" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </button>

        {!showSolution && (
          <>
            {!hintText && (
              <button className="btn" onClick={handleGetHint}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Indice
              </button>
            )}
            <button className="btn" onClick={handleRevealSolution}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Solution
            </button>
          </>
        )}

        {answered && nextQuiz && (
          <button
            className="btn btn-accent"
            onClick={onNext}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Défi suivant — #{String(nextQuiz.id).padStart(2, '0')}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}
      </div>

      {/* Solution */}
      {showSolution && (
        <div className="solution mt-24">
          <h3>Solution</h3>
          <pre className="code-block">{fullQuiz.solution.query}</pre>
          <p className="explanation">{fullQuiz.solution.explanation}</p>
          {solutionResult !== null && (
            <div className="mt-16">
              <h3>Résultat réel</h3>
              <pre className="code-block result-block">
                {JSON.stringify(solutionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
