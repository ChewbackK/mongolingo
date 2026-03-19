import { useState } from 'react';

export default function DataPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const action = async (url, method = 'POST') => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/data/${url}`, { method });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: JSON.stringify(data, null, 2) });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur' });
      }
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
      <h1>Gestion des donnees</h1>

      <h2>Chargement</h2>
      <div className="data-actions">
        <button className="btn btn-accent" onClick={() => action('load')} disabled={loading}>
          {loading ? 'Chargement...' : 'Charger les donnees de demo'}
        </button>
      </div>

      <h2>Export</h2>
      <div className="data-actions">
        <button className="btn" onClick={() => download('export/json', 'mongolingo-export.zip')}>
          Export JSON (zip)
        </button>
        <button className="btn" onClick={() => download('export/bson', 'mongolingo-bson.zip')}>
          Export BSON (mongodump)
        </button>
      </div>

      <h2>Sauvegarde</h2>
      <div className="data-actions">
        <button className="btn" onClick={() => action('backup')} disabled={loading}>
          Creer une sauvegarde
        </button>
        <button className="btn" onClick={() => action('restore')} disabled={loading}>
          Restaurer la derniere sauvegarde
        </button>
      </div>

      {status && (
        <pre className={`data-status ${status.type}`}>
          {status.message}
        </pre>
      )}
    </div>
  );
}
