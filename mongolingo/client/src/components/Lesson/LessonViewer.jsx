import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function LessonViewer({ lesson, onComplete, isCompleted }) {
  if (!lesson) return null;

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '40px',
      color: 'var(--text-primary)'
    }}>
      <h2 style={{ fontSize: '2em', marginBottom: '24px', color: 'var(--green)' }}>
        {lesson.title}
      </h2>
      
      <div className="lesson-content" style={{ lineHeight: '1.6', fontSize: '1.1em', color: 'var(--text-secondary)' }}>
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </div>

      <div style={{
        marginTop: '40px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border)'
      }}>
        <a 
          href={lesson.docsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginBottom: '24px',
            color: 'var(--blue)',
            textDecoration: 'underline'
          }}
        >
          📖 Lire la documentation officielle MongoDB
        </a>
        
        <button
          onClick={() => onComplete(lesson.level)}
          className="btn btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '1.1em', background: isCompleted ? 'var(--bg-elevated)' : 'var(--green)', color: isCompleted ? 'var(--text-primary)' : '#000' }}
        >
          {isCompleted ? "✓ Leçon terminée (Retourner)" : "J'ai compris ! (Marquer comme lu)"}
        </button>
      </div>
    </div>
  );
}
