import { useState, useEffect } from 'react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [schema, setSchema] = useState(null);
  const [sample, setSample] = useState(null);

  useEffect(() => {
    fetch('/api/collections').then(r => r.json()).then(setCollections);
  }, []);

  const selectCollection = async (name) => {
    setSelected(name);
    const [schemaRes, sampleRes] = await Promise.all([
      fetch(`/api/collections/${name}/schema`).then(r => r.json()),
      fetch(`/api/collections/${name}/sample`).then(r => r.json()),
    ]);
    setSchema(schemaRes);
    setSample(sampleRes);
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
