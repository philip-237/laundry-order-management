import { useId } from 'react';

export default function FormField({ label, error, children }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? `${id}-error` : undefined,
      })}
      {error && <small className="field-error" id={`${id}-error`}>{error}</small>}
    </div>
  );
}
