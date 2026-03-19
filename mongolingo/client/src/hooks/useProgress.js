import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mongolingo-progress';

const initialState = { completed: [], history: [] };

export default function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const markCompleted = (quizId, answer, correct) => {
    setProgress(prev => ({
      completed: correct && !prev.completed.includes(quizId)
        ? [...prev.completed, quizId]
        : prev.completed,
      history: [
        ...prev.history,
        { quizId, answer, correct, timestamp: new Date().toISOString() }
      ]
    }));
  };

  const isCompleted = (quizId) => progress.completed.includes(quizId);

  const reset = () => {
    setProgress(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { progress, markCompleted, isCompleted, reset };
}
