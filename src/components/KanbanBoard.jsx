import React, { useState, useEffect, useMemo } from 'react';
import { COLUMNS, VALID_COLUMN_IDS, DEFAULT_COLUMN_ID, PRIORITIES, DEFAULT_PRIORITY } from '../constants/columns';
import { loadTasksFromStorage, saveTasksToStorage, generateNextTaskId } from '../utils/storage';
import KanbanColumn from './KanbanColumn';
import TaskForm from './TaskForm';
import DeleteConfirmModal from './DeleteConfirmModal';

/**
 * KanbanBoard Component
 * Main coordinator for board state, drag-and-drop events, modal dialogs, and persistence.
 */
export default function KanbanBoard() {
  // Initialize tasks from localStorage safely
  const [tasks, setTasks] = useState(() => loadTasksFromStorage());

  // Priority filter state ('all' | 'high' | 'medium' | 'low')
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Drag-and-drop state
  const [activeDragTaskId, setActiveDragTaskId] = useState(null);

  // Form modal state (for create & edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [createColumnId, setCreateColumnId] = useState(DEFAULT_COLUMN_ID);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: ''
  });

  // Automatically persist tasks to localStorage whenever tasks change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Priority counts for filter pills
  const priorityCounts = useMemo(() => {
    const counts = { all: tasks.length, high: 0, medium: 0, low: 0 };
    tasks.forEach((t) => {
      const p = t.priority || DEFAULT_PRIORITY;
      if (counts[p] !== undefined) {
        counts[p] += 1;
      }
    });
    return counts;
  }, [tasks]);

  // Filter tasks based on selected priority
  const filteredTasks = useMemo(() => {
    if (priorityFilter === 'all') {
      return tasks;
    }
    return tasks.filter((t) => (t.priority || DEFAULT_PRIORITY) === priorityFilter);
  }, [tasks, priorityFilter]);

  // Group filtered tasks by column status using useMemo to avoid unnecessary recalculations
  const tasksByColumn = useMemo(() => {
    const grouped = {
      'todo': [],
      'in-progress': [],
      'done': []
    };

    filteredTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        // Fallback safety for unexpected status
        grouped['todo'].push({ ...task, status: 'todo' });
      }
    });

    return grouped;
  }, [filteredTasks]);

  // Overall task statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    return { total, completed, inProgress };
  }, [tasks]);

  /* -------------------------------------------------------------
   * Drag and Drop Handlers (HTML5 Native DnD)
   * ----------------------------------------------------------- */

  const handleDragStart = (taskId) => {
    setActiveDragTaskId(taskId);
  };

  const handleDragEnd = () => {
    setActiveDragTaskId(null);
  };

  const handleDropTask = (draggedTaskId, targetColumnId) => {
    setActiveDragTaskId(null);

    // Defensive validation
    if (!draggedTaskId || !VALID_COLUMN_IDS.includes(targetColumnId)) {
      return;
    }

    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((t) => t.id === draggedTaskId);
      if (taskIndex === -1) {
        return prevTasks;
      }

      const currentTask = prevTasks[taskIndex];

      // If dropped in the same column, no status update needed
      if (currentTask.status === targetColumnId) {
        return prevTasks;
      }

      const updatedTasks = [...prevTasks];
      updatedTasks[taskIndex] = {
        ...currentTask,
        status: targetColumnId
      };

      return updatedTasks;
    });
  };

  /* -------------------------------------------------------------
   * Create & Edit Handlers
   * ----------------------------------------------------------- */

  const handleOpenCreateModal = (columnId = DEFAULT_COLUMN_ID) => {
    setTaskToEdit(null);
    setCreateColumnId(columnId);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const handleSaveTask = ({ id, title, description, status, priority }) => {
    if (id) {
      // Edit existing task: keeps existing column status and updates priority
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === id
            ? {
                ...t,
                title,
                description,
                priority: priority || t.priority || DEFAULT_PRIORITY,
                status: t.status // preserve existing column
              }
            : t
        )
      );
    } else {
      // Create new task with sequential ID and priority
      setTasks((prevTasks) => {
        const newTask = {
          id: generateNextTaskId(prevTasks),
          title,
          description,
          status: status || DEFAULT_COLUMN_ID,
          priority: priority || DEFAULT_PRIORITY
        };
        return [...prevTasks, newTask];
      });
    }

    handleCloseForm();
  };

  /* -------------------------------------------------------------
   * Delete Handlers
   * ----------------------------------------------------------- */

  const handleOpenDeleteModal = (taskId, taskTitle) => {
    setDeleteModal({
      isOpen: true,
      taskId,
      taskTitle
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      taskId: null,
      taskTitle: ''
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.taskId) {
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== deleteModal.taskId));
    }
    handleCloseDeleteModal();
  };

  return (
    <div className="kanban-app">
      {/* Top Application Header */}
      <header className="kanban-header">
        <div className="kanban-header__container">
          <div className="kanban-header__branding">
            <div className="kanban-header__logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="5" height="18" rx="1" />
                <rect x="10" y="3" width="5" height="12" rx="1" />
                <rect x="17" y="3" width="5" height="8" rx="1" />
              </svg>
            </div>
            <div>
              <h1 className="kanban-header__title">Kanban Task Board</h1>
              <p className="kanban-header__subtitle">
                Organize, track, and complete your tasks with seamless drag &amp; drop
              </p>
            </div>
          </div>

          <div className="kanban-header__controls">
            <div className="kanban-header__stats" aria-label="Task progress summary">
              <span className="stat-pill" title="Total Tasks">
                Total: <strong>{stats.total}</strong>
              </span>
              <span className="stat-pill stat-pill--progress" title="In Progress Tasks">
                Active: <strong>{stats.inProgress}</strong>
              </span>
              <span className="stat-pill stat-pill--done" title="Completed Tasks">
                Done: <strong>{stats.completed}</strong>
              </span>
            </div>

            <button
              type="button"
              id="add-task-btn"
              className="btn btn--primary btn--header"
              onClick={() => handleOpenCreateModal(DEFAULT_COLUMN_ID)}
              aria-label="Add new task"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Kanban Columns Board */}
      <main className="kanban-board-container" id="kanban-board">
        {/* Priority Filter Toolbar */}
        <section className="kanban-filter-bar" aria-label="Filter tasks by priority">
          <div className="priority-filter">
            <span className="priority-filter__label" id="priority-filter-heading">
              Priority:
            </span>
            <div
              className="priority-filter__group"
              role="radiogroup"
              aria-labelledby="priority-filter-heading"
            >
              <button
                type="button"
                className={`priority-filter__btn ${priorityFilter === 'all' ? 'priority-filter__btn--active' : ''}`}
                onClick={() => setPriorityFilter('all')}
                role="radio"
                aria-checked={priorityFilter === 'all'}
              >
                <span>All</span>
                <span className="priority-filter__count">{priorityCounts.all}</span>
              </button>
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`priority-filter__btn priority-filter__btn--${p.id} ${priorityFilter === p.id ? 'priority-filter__btn--active' : ''}`}
                  onClick={() => setPriorityFilter(p.id)}
                  role="radio"
                  aria-checked={priorityFilter === p.id}
                >
                  <span className={`priority-filter__dot priority-filter__dot--${p.id}`} aria-hidden="true" />
                  <span>{p.label}</span>
                  <span className="priority-filter__count">{priorityCounts[p.id]}</span>
                </button>
              ))}
            </div>
          </div>

          {priorityFilter !== 'all' && (
            <div className="priority-filter__status" aria-live="polite">
              <span>
                Filtering by <strong>{priorityFilter}</strong> ({priorityCounts[priorityFilter]} tasks)
              </span>
              <button
                type="button"
                className="priority-filter__clear-btn"
                onClick={() => setPriorityFilter('all')}
                title="Clear priority filter"
              >
                Reset
              </button>
            </div>
          )}
        </section>

        <div className="kanban-columns-grid">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              activeDragTaskId={activeDragTaskId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropTask={handleDropTask}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleOpenDeleteModal}
              onQuickAddTask={handleOpenCreateModal}
            />
          ))}
        </div>
      </main>

      {/* Create / Edit Task Modal Dialog */}
      <TaskForm
        isOpen={isFormOpen}
        taskToEdit={taskToEdit}
        defaultColumnId={createColumnId}
        onSave={handleSaveTask}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation Modal Dialog */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        taskTitle={deleteModal.taskTitle}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteModal}
      />
    </div>
  );
}
