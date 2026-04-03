import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

function LeafIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9 2 6 5.2 6 9.8c0 3.8 2.2 6.8 6 8.2 3.8-1.4 6-4.4 6-8.2C18 5.2 15 2 12 2z"/>
      <path d="M12 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function IconQuiz() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}

function IconCollections() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
      <path d="M3 12a9 3 0 0 0 18 0"/>
    </svg>
  );
}

function IconData() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function IconProgress() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function IconLessons() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}

export default function Topbar() {
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    const check = () => {
      fetch('/api/health')
        .then(r => r.json())
        .then(d => setDbStatus(d.status === 'connected' ? 'connected' : 'disconnected'))
        .catch(() => setDbStatus('disconnected'));
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="topbar">
      <div className="topbar-brand">
        <img src="/logo.png" alt="mongolingo" className="brand-logo-img" />
        <span className="brand-name">mongo<em>lingo</em></span>
      </div>

      <div className="topbar-links">
        <NavLink to="/">
          <IconQuiz />
          Quiz
        </NavLink>
        <NavLink to="/lessons">
          <IconLessons />
          Leçons
        </NavLink>
        <NavLink to="/collections">
          <IconCollections />
          Collections
        </NavLink>
        <NavLink to="/data">
          <IconData />
          Données
        </NavLink>
        <NavLink to="/progress">
          <IconProgress />
          Progression
        </NavLink>
      </div>

      <div className={`topbar-status ${dbStatus}`}>
        <span className="status-dot" />
        MongoDB
      </div>
    </nav>
  );
}
