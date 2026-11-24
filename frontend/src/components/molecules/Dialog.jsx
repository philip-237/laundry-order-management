import { useEffect, useId, useRef } from 'react';
import Button from '../atoms/Button';

export default function Dialog({ title, onClose, pending, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog ref={ref} aria-labelledby={titleId} onCancel={(event) => {
      event.preventDefault();
      if (!pending) onClose();
    }}>
      <div className="dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <Button variant="secondary" disabled={pending} onClick={onClose}>Close</Button>
      </div>
      {children}
    </dialog>
  );
}
