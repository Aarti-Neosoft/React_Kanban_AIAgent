import React from 'react';
import { COLUMNS, VALID_COLUMN_IDS } from '../constants/columns';
import { formatDueDate, isOverdue } from '../utils/dates';

/**
 * TaskCard Component
 * Displays individual task details, provides HTML5 drag source capabilities,
 * and supports full keyboard navigation between Kanban columns.
 *
 * @param {Object} props
 * @param {Object} props.task - The task object { id, title, description, status, priority, dueDate, comments }
 * @param {boolean} [props.isSelected=false] - Whether this card is currently selected
 * @param {boolean} [props.isDragging=false] - Whether this card is currently being dragged
 * @param {Function} [props.onDragStart] - Callback when drag operation starts
 * @param {Function} [props.onDragEnd] - Callback when drag operation completes
 * @param {Function} [props.onEdit] - Callback when edit button is clicked
 * @param {Function} [props.onDelete] - Callback when delete button is clicked
 * @param {Function} [props.onSelect] - Callback when card is selected
 * @param {Function} [props.onMoveTask] - Callback to move task to target column (taskId, targetColumnId)
 */
export default function TaskCard({
  task,
  isSelected = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onSelect,
  onMoveTask
}) {
  const currentColumnIndex = VALID_COLUMN_IDS.indexOf(task.status);
  const canMoveLeft = currentColumnIndex > 0;
  const canMoveRight = currentColumnIndex !== -1 && currentColumnIndex < VALID_COLUMN_IDS.length - 1;

  const prevColumnId = canMoveLeft ? VALID_COLUMN_IDS[currentColumnIndex - 1] : null;
  const nextColumnId = canMoveRight ? VALID_COLUMN_IDS[currentColumnIndex + 1] : null;

  const prevColumn = COLUMNS.find((col) => col.id === prevColumnId);
  const nextColumn = COLUMNS.find((col) => col.id === nextColumnId);
  const currentColumn = COLUMNS.find((col) => col.id === task.status);

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

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(task.id);
    }
  };

  const handleKeyDown = (e) => {
    // Only handle keyboard navigation if event originates directly on the card article
    if (e.target !== e.currentTarget) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (canMoveRight && onMoveTask) {
        onMoveTask(task.id, nextColumnId);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (canMoveLeft && onMoveTask) {
        onMoveTask(task.id, prevColumnId);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onSelect) {
        onSelect(task.id);
      }
    }
  };

  const handleMoveLeftClick = (e) => {
    e.stopPropagation();
    if (canMoveLeft && onMoveTask) {
      onMoveTask(task.id, prevColumnId);
    }
  };

  const handleMoveRightClick = (e) => {
    e.stopPropagation();
    if (canMoveRight && onMoveTask) {
      onMoveTask(task.id, nextColumnId);
    }
  };

  const handleEditClick = (e) => {
    // Prevent event bubbling so dragging or card selection isn't triggered
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDeleteClick = (e) => {
    // Prevent event bubbling so dragging or card selection isn't triggered
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id, task.title);
    }
  };

  const priority = task.priority || 'medium';
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  const overdue = isOverdue(task.dueDate, task.status);
  const commentsCount = Array.isArray(task.comments) ? task.comments.length : 0;
  const columnName = currentColumn?.title || task.status;

  return (
    <article
      id={`task-card-${task.id}`}
      className={`task-card ${isDragging ? 'task-card--dragging' : ''} ${overdue ? 'task-card--overdue' : ''} ${isSelected ? 'task-card--selected' : ''}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Task: ${task.title}, Priority: ${priorityLabel}, Column: ${columnName}. Press Left or Right arrow to move between columns.`}
      tabIndex={0}
    >
      <div className="task-card__drag-indicator" title="Drag to move column" aria-hidden="true">
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
        {commentsCount > 0 && (
          <div className="task-card__comment-badge" title={`${commentsCount} activity notes`}>
            <span aria-hidden="true">💬</span>
            <span>{commentsCount} {commentsCount === 1 ? 'note' : 'notes'}</span>
          </div>
        )}
      </div>

      <div
        className="task-card__actions"
        draggable={false}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="task-card__move-group" role="group" aria-label="Move task between columns">
          <button
            type="button"
            className="task-card__btn task-card__btn--move"
            onClick={handleMoveLeftClick}
            disabled={!canMoveLeft}
            aria-label={canMoveLeft ? `Move task "${task.title}" to ${prevColumn?.title}` : 'Cannot move left, already in first column'}
            title={canMoveLeft ? `Move to ${prevColumn?.title} (Left Arrow)` : 'Already in first column'}
          >
            <span aria-hidden="true">&larr;</span>
            <span className="task-card__btn-text">Move</span>
          </button>
          <button
            type="button"
            className="task-card__btn task-card__btn--move"
            onClick={handleMoveRightClick}
            disabled={!canMoveRight}
            aria-label={canMoveRight ? `Move task "${task.title}" to ${nextColumn?.title}` : 'Cannot move right, already in last column'}
            title={canMoveRight ? `Move to ${nextColumn?.title} (Right Arrow)` : 'Already in last column'}
          >
            <span className="task-card__btn-text">Move</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <button
          type="button"
          className="task-card__btn task-card__btn--edit"
          onClick={handleEditClick}
          aria-label={`Edit task "${task.title}"`}
          title="Edit task"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
