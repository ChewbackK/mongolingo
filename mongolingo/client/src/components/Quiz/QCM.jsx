import { useState } from 'react';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QCM({ quiz, onResult }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    onResult(index === quiz.correct, quiz.options[index]);
  };

  return (
    <div className="qcm-options">
      {quiz.options.map((opt, i) => {
        let cls = 'qcm-option';
        if (answered) {
          cls += ' disabled';
          if (i === quiz.correct) cls += ' correct';
          else if (i === selected) cls += ' incorrect';
        }
        return (
          <button key={i} className={cls} onClick={() => handleSelect(i)}>
            <span className="qcm-letter">{LETTERS[i]}</span>
            <span className="qcm-text">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
