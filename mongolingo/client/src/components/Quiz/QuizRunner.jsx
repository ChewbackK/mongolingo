import { useState, useEffect } from 'react';
import QCM from './QCM';
import FillBlanks from './FillBlanks';
import FreeInput from './FreeInput';

export default function QuizRunner({ quiz, onBack, onComplete }) {
  const [fullQuiz, setFullQuiz] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionResult, setSolutionResult] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    fetch(`/api/quiz/${quiz.id}`)
      .then(r => r.json())
      .then(setFullQuiz);
  }, [quiz.id]);

  if (!fullQuiz) return <div className="loading">Chargement...</div>;

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
          body: JSON.stringify({ query: fullQuiz.solution.query })
        });
        const data = await res.json();
        if (data.success) setSolutionResult(data.data);
      } catch {}
    }
  };

  const handleGetHint = async () => {
    const res = await fetch(`/api/quiz/${quiz.id}/hint`);
    const data = await res.json();
    alert(data.hint);
  };

  const ModeComponent = { qcm: QCM, blancs: FillBlanks, libre: FreeInput }[fullQuiz.mode];

  return (
    <div>
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        ← Retour
      </button>

      <div className="quiz-header">
        <span className="quiz-level">Niveau {fullQuiz.niveau}</span>
        <span className="quiz-mode">{fullQuiz.mode}</span>
        <span className="quiz-mode">{fullQuiz.collection}</span>
      </div>

      <h2 className="quiz-enonce">{fullQuiz.enonce}</h2>

      <ModeComponent quiz={fullQuiz} onResult={handleResult} />

      <div className="flex gap-8 mt-24">
        {!showSolution && (
          <>
            <button className="btn" onClick={handleGetHint}>Indice</button>
            <button className="btn" onClick={handleRevealSolution}>Voir la solution</button>
          </>
        )}
      </div>

      {showSolution && (
        <div className="solution mt-24">
          <h3>Solution</h3>
          <pre className="code-block">{fullQuiz.solution.query}</pre>
          <p className="explanation">{fullQuiz.solution.explanation}</p>
          {solutionResult !== null && (
            <div className="mt-16">
              <h3>Resultat reel</h3>
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
