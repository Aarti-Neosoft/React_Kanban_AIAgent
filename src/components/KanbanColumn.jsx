import React, { useState } from 'react';
import TaskCard from './TaskCard';

/**
 * KanbanColumn Component
 * Represents a single lifecycle column ('todo', 'in-progress', 'done')
 * and acts as an HTML5 drop zone for tasks.
 *
 * @param {Object} props
 * @param {Object} props.column - Column metadata { id, title, description, accentColor, emptyText }
 * @param {Array<Object>} props.tasks - List of tasks belonging to this column
 * @param {string|null} props.activeDragTaskId - ID of task currently being dragged, if any
 * @param {Function} props.onDragStart - Callback when drag begins on a child card
 * @param {Function} props.onDragEnd - Callback when drag ends
 * @param {Function} props.onDropTask - Callback when a task is dropped on this column (taskId, targetColumnId)
 * @param {Function} props.onEditTask - Callback to open edit modal for a task
 * @param {Function} props.onDeleteTask - Callback to open delete confirm for a task
 * @param {Function} props.onQuickAddTask - Callback to add task directly with this column pre-selected
 */
export default function KanbanColumn({
  column,
  tasks = [],
  activeDragTaskId = null,
  onDragStart,
  onDragEnd,
  onDropTask,
  onEditTask,
  onDeleteTask,
  onQuickAddTask
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    // Required to allow drop in HTML5 DnD
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only remove highlight if actually leaving this column container,
    // not just moving over a child element inside it.
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onDropTask) {
      onDropTask(taskId, column.id);
    }
  };

  return (
    <section
      id={`kanban-column-${column.id}`}
      className={`kanban-column ${isDragOver ? 'kanban-column--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`${column.title} column with ${tasks.length} tasks`}
    >
      {/* Column Header */}
      <header className="kanban-column__header">
        <div className="kanban-column__title-wrapper">
          <span
            className="kanban-column__indicator"
            style={{ backgroundColor: column.accentColor }}
            aria-hidden="true"
          />
          <h3 className="kanban-column__title">{column.title}</h3>
          <span
            className="kanban-column__count-badge"
            aria-label={`${tasks.length} tasks in ${column.title}`}
          >
            {tasks.length}
          </span>
        </div>

        {onQuickAddTask && (
          <button
            type="button"
            className="kanban-column__add-btn"
            onClick={() => onQuickAddTask(column.id)}
            title={`Add task to ${column.title}`}
            aria-label={`Add task to ${column.title}`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}
      </header>

      {/* Task List / Drop Zone */}
      <div className="kanban-column__task-list">
        {tasks.length === 0 ? (
          <div className="kanban-column__empty-state">
            <div className="kanban-column__empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray="3 3" />
                <path d="M12 8v8M8 12h8" strokeLinecap="round" opacity="0.4" />
              </svg>
            </div>
            <p className="kanban-column__empty-text">{column.emptyText}</p>
            {isDragOver && (
              <div className="kanban-column__drop-hint">Drop here to move</div>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={activeDragTaskId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </section>
  );
}
