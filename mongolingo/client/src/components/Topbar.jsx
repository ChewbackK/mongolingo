import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
      <div className="topbar-brand">mongolingo</div>
      <div className="topbar-links">
        <NavLink to="/">Quiz</NavLink>
        <NavLink to="/collections">Collections</NavLink>
        <NavLink to="/data">Donnees</NavLink>
        <NavLink to="/progress">Progression</NavLink>
      </div>
      <div className={`topbar-status ${dbStatus}`}>
        <span className="status-dot"></span>
        MongoDB
      </div>
    </nav>
  );
}
