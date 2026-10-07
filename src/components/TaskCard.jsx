import React from 'react';
import { formatDueDate, isOverdue } from '../utils/dates';

/**
 * TaskCard Component
 * Displays individual task details and provides HTML5 drag source capabilities.
 *
 * @param {Object} props
 * @param {Object} props.task - The task object { id, title, description, status }
 * @param {boolean} props.isDragging - Whether this card is currently being dragged
 * @param {Function} props.onDragStart - Callback when drag operation starts
 * @param {Function} props.onDragEnd - Callback when drag operation completes
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 */
export default function TaskCard({
  task,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete
}) {
  const handleDragStart = (e) => {
    // Set dragged task ID on HTML5 dataTransfer
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';

    if (onDragStart) {
      onDragStart(task.id);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleEditClick = (e) => {
    // Prevent event bubbling so dragging or column clicks aren't triggered
    e.stopPropagation();
    onEdit(task);
  };

  const handleDeleteClick = (e) => {
    // Prevent event bubbling so dragging or column clicks aren't triggered
    e.stopPropagation();
    onDelete(task.id, task.title);
  };

  const priority = task.priority || 'medium';
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <article
      id={`task-card-${task.id}`}
      className={`task-card ${isDragging ? 'task-card--dragging' : ''} ${overdue ? 'task-card--overdue' : ''}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      aria-label={`Task: ${task.title}, Priority: ${priorityLabel}`}
      tabIndex={0}
    >
      <div className="task-card__drag-indicator" title="Drag to reorder" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </div>

      <div className="task-card__top">
        <span
          className={`priority-badge priority-badge--${priority}`}
          title={`Priority: ${priorityLabel}`}
        >
          <span className="priority-badge__dot" aria-hidden="true" />
          {priorityLabel}
        </span>
      </div>

      <div className="task-card__content">
        <h4 className="task-card__title">{task.title}</h4>
        {task.description && task.description.trim().length > 0 && (
          <p className="task-card__description">{task.description}</p>
        )}
        {task.dueDate && (
          <p className={`task-card__due-date ${overdue ? 'task-card__due-date--overdue' : ''}`}>
            Due: {formatDueDate(task.dueDate)}
            {overdue && <span className="task-card__overdue-label">Overdue</span>}
          </p>
        )}
      </div>

      <div
        className="task-card__actions"
        draggable={false}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="task-card__btn task-card__btn--edit"
          onClick={handleEditClick}
          aria-label={`Edit task "${task.title}"`}
          title="Edit task"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Edit</span>
        </button>

        <button
          type="button"
          className="task-card__btn task-card__btn--delete"
          onClick={handleDeleteClick}
          aria-label={`Delete task "${task.title}"`}
          title="Delete task"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
}
