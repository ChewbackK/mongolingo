import { useState } from 'react';

export default function FreeInput({ quiz, onResult }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        onResult(true, query.trim());
      } else {
        setError(data.error);
        onResult(false, query.trim());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        className="query-input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={`db.${quiz.collection}.`}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleExecute(); }}
      />
      <div className="flex gap-8 mt-16">
        <button className="btn btn-accent" onClick={handleExecute} disabled={loading || !query.trim()}>
          {loading ? 'Execution...' : 'Executer (Ctrl+Enter)'}
        </button>
      </div>
      {error && <div className="data-status error mt-16">{error}</div>}
      {result !== null && (
        <div className="mt-16">
          <h3>Resultat</h3>
          <pre className="code-block result-block">
            {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
          </pre>
        </div>
      )}
    </div>
  );
}
