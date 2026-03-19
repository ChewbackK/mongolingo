import { useState } from 'react';

export default function QCM({ quiz, onResult }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    const correct = index === quiz.correct;
    onResult(correct, quiz.options[index]);
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
            {opt}
          </button>
        );
      })}
    </div>
  );
}
