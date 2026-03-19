import { useState } from 'react';

export default function FillBlanks({ quiz, onResult }) {
  const [values, setValues] = useState(quiz.blanks.map(() => ''));
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState(null);

  const handleChange = (index, val) => {
    const next = [...values];
    next[index] = val;
    setValues(next);
  };

  const handleSubmit = () => {
    const res = values.map((v, i) => v.trim() === quiz.blanks[i]);
    setResults(res);
    setAnswered(true);
    const correct = res.every(Boolean);
    onResult(correct, values.join(', '));
  };

  // Render template with input fields replacing ___
  const parts = quiz.template.split('___');

  return (
    <div>
      <div className="fill-template">
        {parts.map((part, i) => {
          const bi = i; // blank index = part index (N parts → N-1 blanks)
          return (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <input
                  className={`blank-input ${answered ? (results[bi] ? 'correct' : 'incorrect') : ''}`}
                  value={values[bi]}
                  onChange={e => handleChange(bi, e.target.value)}
                  disabled={answered}
                  placeholder="..."
                  style={{ width: Math.max(80, (quiz.blanks[bi]?.length || 5) * 10 + 20) }}
                />
              )}
            </span>
          );
        })}
      </div>
      {!answered && (
        <button className="btn btn-accent mt-16" onClick={handleSubmit}>
          Valider
        </button>
      )}
    </div>
  );
}
