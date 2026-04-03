import React, { useState } from 'react';
import { LESSONS } from '../data/lessons';
import useProgress from '../hooks/useProgress';
import LessonViewer from '../components/Lesson/LessonViewer';

export default function LessonsPage() {
  const { isLessonCompleted, markLessonCompleted } = useProgress();
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleLessonComplete = (level) => {
    markLessonCompleted(level);
    setSelectedLevel(null); 
  };

  const selectedLesson = LESSONS.find(l => l.level === selectedLevel);

  if (selectedLesson) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <button 
          onClick={() => setSelectedLevel(null)}
          className="btn btn-ghost"
          style={{ marginBottom: '20px' }}
        >
          ← Retour à la liste
        </button>
        <LessonViewer 
          lesson={selectedLesson} 
          isCompleted={isLessonCompleted(selectedLesson.level)}
          onComplete={handleLessonComplete} 
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5em', marginBottom: '32px', color: 'var(--text-primary)' }}>
        Leçons MongoDB
      </h1>
      
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {LESSONS.map((lesson) => {
          const completed = isLessonCompleted(lesson.level);
          
          return (
            <div 
              key={lesson.level}
              style={{
                border: completed ? '1px solid var(--green)' : '1px solid var(--border)',
                background: completed ? 'var(--green-dim)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setSelectedLevel(lesson.level)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--green)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = completed ? 'var(--green)' : 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.4em', color: 'var(--text-primary)', margin: 0 }}>
                  {lesson.title}
                </h3>
                {completed && (
                  <span style={{ 
                    background: 'var(--green)', color: '#000', 
                    borderRadius: '50%', width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '14px'
                  }}>
                    ✓
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
                {lesson.content.substring(0, 120)}...
              </p>
              <span style={{ 
                color: completed ? 'var(--green)' : 'var(--blue)', 
                fontWeight: 'bold', fontSize: '0.9em', letterSpacing: '0.5px' 
              }}>
                {completed ? 'RÉVISER LA LEÇON →' : 'COMMENCER →'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
