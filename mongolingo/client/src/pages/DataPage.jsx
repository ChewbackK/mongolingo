import { useState } from 'react';

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="data-section-label">{label}</div>
      {children}
    </div>
  );
}

export default function DataPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const action = async (url, method = 'POST') => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/data/${url}`, { method });
      const data = await res.json();
      setStatus(res.ok
        ? { type: 'success', message: JSON.stringify(data, null, 2) }
        : { type: 'error', message: data.error || 'Erreur' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const download = (url, filename) => {
    const a = document.createElement('a');
    a.href = `/api/data/${url}`;
    a.download = filename;
    a.click();
  };

  return (
    <div>
      <h1>Gestion des données</h1>

      <Section label="Chargement">
        <div className="data-actions">
          <button className="btn btn-accent" onClick={() => action('load')} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {loading ? 'Chargement…' : 'Charger les données de démo'}
          </button>
        </div>
      </Section>

      <Section label="Export">
        <div className="data-actions">
          <button className="btn" onClick={() => download('export/json', 'mongolingo-export.zip')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Export JSON (.zip)
          </button>
          <button className="btn" onClick={() => download('export/bson', 'mongolingo-bson.zip')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
              <path d="M3 12a9 3 0 0 0 18 0"/>
            </svg>
            Export BSON (mongodump)
          </button>
        </div>
      </Section>

      <Section label="Sauvegarde">
        <div className="data-actions">
          <button className="btn" onClick={() => action('backup')} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Créer une sauvegarde
          </button>
          <button className="btn" onClick={() => action('restore')} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/>
            </svg>
            Restaurer la dernière sauvegarde
          </button>
        </div>
      </Section>

      {status && (
        <pre className={`data-status ${status.type}`}>
          {status.message}
        </pre>
      )}
    </div>
  );
}
