import { useState, useEffect } from 'react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [schema, setSchema] = useState(null);
  const [sample, setSample] = useState(null);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    fetch('/api/collections')
      .then(r => {
        if (!r.ok) throw new Error('unavailable');
        return r.json();
      })
      .then(setCollections)
      .catch(() => setDbError(true));
  }, []);

  const selectCollection = async (name) => {
    setSelected(name);
    try {
      const [schemaRes, sampleRes] = await Promise.all([
        fetch(`/api/collections/${name}/schema`).then(r => r.json()),
        fetch(`/api/collections/${name}/sample`).then(r => {
          if (!r.ok) throw new Error('unavailable');
          return r.json();
        }),
      ]);
      setSchema(schemaRes);
      setSample(sampleRes);
    } catch {}
  };

  const renderProperties = (properties, required = []) => {
    if (!properties) return null;
    return Object.entries(properties).map(([key, val]) => (
      <div key={key} className="schema-field">
        <span className="field-name">
          {key}
          {required.includes(key) && <span style={{ color: 'var(--error)', marginLeft: 4 }}>*</span>}
        </span>
        <span className="field-type">{val.type}{val.enum ? ` [${val.enum.join(', ')}]` : ''}</span>
        <span className="field-desc">{val.description || ''}</span>
      </div>
    ));
  };

  if (dbError) {
    return (
      <div>
        <h1>Collections Cyberespar</h1>
        <div style={{ padding: '16px 20px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-lg)', color: 'var(--error)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontWeight: 600, fontSize: 14 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            MongoDB non disponible
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Lancez <code className="code-inline">mongod</code> puis rechargez la page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Collections Cyberespar</h1>
      <div className="collection-list">
        {collections.map(c => (
          <div
            key={c.name}
            className={`collection-card ${selected === c.name ? 'active' : ''}`}
            onClick={() => selectCollection(c.name)}
          >
            <span className="collection-name">{c.name}</span>
            <span className="collection-count">{c.count} documents</span>
          </div>
        ))}
      </div>

      {selected && schema && (
        <div className="schema-viewer">
          <h2>{schema.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{schema.description}</p>
          <h3>Schema</h3>
          {renderProperties(schema.properties, schema.required)}
          {sample && sample.length > 0 && (
            <div className="mt-24">
              <h3>Exemples</h3>
              <pre className="code-block result-block">
                {JSON.stringify(sample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
