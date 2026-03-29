import { useRef, useState } from 'react';

/**
 * 6-box OTP input with auto-focus, backspace navigation, and paste support.
 * @param {function} onComplete - called with the full 6-digit OTP string
 * @param {boolean} disabled
 */
const OTPInput = ({ onComplete, disabled = false }) => {
  const [values, setValues] = useState(Array(6).fill(''));
  const refs = useRef([]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/, ''); // digits only
    if (!val) return;

    const newValues = [...values];
    newValues[index] = val.slice(-1); // take last digit
    setValues(newValues);

    if (index < 5) {
      refs.current[index + 1]?.focus();
    }

    if (newValues.every(Boolean)) {
      onComplete?.(newValues.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newValues = [...values];
      if (values[index]) {
        newValues[index] = '';
        setValues(newValues);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        newValues[index - 1] = '';
        setValues(newValues);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newValues = Array(6).fill('');
    pasted.split('').forEach((char, i) => { newValues[i] = char; });
    setValues(newValues);

    const nextIndex = Math.min(pasted.length, 5);
    refs.current[nextIndex]?.focus();

    if (pasted.length === 6) onComplete?.(pasted);
  };

  return (
    <div className="flex gap-3 justify-center">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-800 focus:outline-none transition-colors bg-white disabled:opacity-50"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
