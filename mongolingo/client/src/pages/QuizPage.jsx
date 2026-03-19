import { useState, useEffect } from 'react';
import LevelSelect from '../components/Quiz/LevelSelect';
import QuizRunner from '../components/Quiz/QuizRunner';
import useProgress from '../hooks/useProgress';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const { progress, markCompleted, isCompleted } = useProgress();

  useEffect(() => {
    fetch('/api/quiz').then(r => r.json()).then(setQuizzes);
  }, []);

  if (currentQuiz) {
    return (
      <QuizRunner
        quiz={currentQuiz}
        onBack={() => setCurrentQuiz(null)}
        onComplete={markCompleted}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 0 }}>Quiz MongoDB</h1>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {progress.completed.length}/31
        </span>
      </div>
      <div className="progress-bar-container" style={{ marginBottom: 24 }}>
        <div className="progress-bar-fill" style={{ width: `${(progress.completed.length / 31) * 100}%` }} />
      </div>
      <LevelSelect
        quizzes={quizzes}
        onSelectQuiz={setCurrentQuiz}
        isCompleted={isCompleted}
      />
    </div>
  );
}
