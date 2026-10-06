import React, { useEffect } from 'react';

/**
 * DeleteConfirmModal Component
 * Simple accessible modal confirming task deletion.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {string} props.taskTitle - Title of task being deleted
 * @param {Function} props.onConfirm - Callback when delete confirmed
 * @param {Function} props.onClose - Callback when delete cancelled
 */
export default function DeleteConfirmModal({
  isOpen,
  taskTitle = '',
  onConfirm,
  onClose
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="modal-card modal-card--danger"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <header className="modal-header">
          <div className="modal-header__icon modal-header__icon--danger" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <h2 id="delete-dialog-title" className="modal-title">
            Delete Task
          </h2>
        </header>

        <div className="modal-body">
          <p>
            Are you sure you want to delete{' '}
            <strong className="modal-body__highlight">"{taskTitle}"</strong>?
          </p>
          <p className="modal-body__subtext">
            This action cannot be undone and will permanently remove the task.
          </p>
        </div>

        <footer className="modal-footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
          >
            Delete Task
          </button>
        </footer>
      </div>
    </div>
  );
}
