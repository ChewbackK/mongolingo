import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mongolingo-progress';

const initialState = { completed: [], history: [], completedLessons: [] };

export default function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration rétroactive des anciens états locaux
        if (!parsed.completedLessons) parsed.completedLessons = [];
        return parsed;
      }
      return initialState;
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

  const isCompleted = useCallback(
    (quizId) => progress.completed.includes(quizId),
    [progress.completed]
  );

  const markLessonCompleted = (level) => {
    setProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons.includes(level) 
        ? prev.completedLessons 
        : [...prev.completedLessons, level]
    }));
  };

  const isLessonCompleted = useCallback(
    (level) => progress.completedLessons.includes(level),
    [progress.completedLessons]
  );

  const reset = () => {
    setProgress(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { progress, markCompleted, isCompleted, markLessonCompleted, isLessonCompleted, reset };
}
