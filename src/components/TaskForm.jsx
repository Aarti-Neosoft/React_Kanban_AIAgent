import React, { useState, useEffect, useRef } from 'react';
import { PRIORITIES, DEFAULT_PRIORITY } from '../constants/columns';

/**
 * TaskForm Component (Modal Dialog)
 * Handles both creating a new task and editing an existing task.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object|null} props.taskToEdit - Task being edited, or null if creating
 * @param {string} [props.defaultColumnId='todo'] - Pre-selected column for new tasks
 * @param {Function} props.onSave - Callback on valid submit ({ id, title, description, status, priority, dueDate })
 * @param {Function} props.onClose - Callback when modal is cancelled/closed
 */
export default function TaskForm({
  isOpen,
  taskToEdit = null,
  defaultColumnId = 'todo',
  onSave,
  onClose
}) {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const titleInputRef = useRef(null);

  // Synchronize form fields whenever taskToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setDescription(taskToEdit.description || '');
        setPriority(taskToEdit.priority || DEFAULT_PRIORITY);
        setDueDate(taskToEdit.dueDate || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority(DEFAULT_PRIORITY);
        setDueDate('');
      }
      setError('');

      // Autofocus title input on next tick when modal opens
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, taskToEdit]);

  // Handle escape key to close modal
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
      return;
    }

    onSave({
      id: isEditing ? taskToEdit.id : undefined,
      title: trimmedTitle,
      description: description.trim(),
      status: isEditing ? taskToEdit.status : defaultColumnId,
      priority: priority || DEFAULT_PRIORITY,
      dueDate: dueDate || null
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setPriority(DEFAULT_PRIORITY);
    setDueDate('');
    setError('');
  };

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
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <header className="modal-header">
          <h2 id="task-form-title" className="modal-title">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close dialog"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="task-form" noValidate>
          <div className="form-group">
            <label htmlFor="task-title-input" className="form-label">
              Task Title <span className="form-required" aria-hidden="true">*</span>
            </label>
            <input
              id="task-title-input"
              ref={titleInputRef}
              type="text"
              className={`form-input ${error ? 'form-input--error' : ''}`}
              placeholder="e.g. Design responsive layout"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'task-title-error' : undefined}
            />
            {error && (
              <p id="task-title-error" className="form-error-msg" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="task-priority-select" className="form-label">
              Priority
            </label>
            <select
              id="task-priority-select"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} Priority
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-due-date-input" className="form-label">
              Due Date <span className="form-optional">(optional)</span>
            </label>
            <input
              id="task-due-date-input"
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc-input" className="form-label">
              Description <span className="form-optional">(optional)</span>
            </label>
            <textarea
              id="task-desc-input"
              className="form-textarea"
              placeholder="Add key details or acceptance criteria..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
