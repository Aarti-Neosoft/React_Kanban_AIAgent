import React, { useState, useEffect, useMemo, useRef } from 'react';
import { COLUMNS, VALID_COLUMN_IDS, DEFAULT_COLUMN_ID, PRIORITIES, DEFAULT_PRIORITY } from '../constants/columns';
import { loadTasksFromStorage, saveTasksToStorage, generateNextTaskId } from '../utils/storage';
import KanbanColumn from './KanbanColumn';
import TaskForm from './TaskForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import MessyTaskList from './MessyTaskList';

/**
 * KanbanBoard Component
 * Main coordinator for board state, drag-and-drop events, keyboard task movements,
 * modal dialogs, persistence, and task activity integration.
 */
export default function KanbanBoard() {
  // Initialize tasks from localStorage safely
  const [tasks, setTasks] = useState(() => loadTasksFromStorage());

  // Priority filter state ('all' | 'high' | 'medium' | 'low')
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Drag-and-drop state
  const [activeDragTaskId, setActiveDragTaskId] = useState(null);

  // Active selected task ID for activity & notes (Phase 3)
  const [selectedTaskId, setSelectedTaskId] = useState(() => {
    const initialTasks = loadTasksFromStorage();
    return initialTasks.length > 0 ? initialTasks[0].id : null;
  });

  // Accessible live announcement message for screen readers
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

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
  const [deletedTask, setDeletedTask] = useState(null);
  const undoTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  }, []);

  // Automatically persist tasks to localStorage whenever tasks change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Selected task derivation
  const selectedTask = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    return tasks.find((t) => t.id === selectedTaskId) || tasks[0];
  }, [tasks, selectedTaskId]);

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

  // Group filtered tasks by column status
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
   * Drag, Drop, and Keyboard Movement Handlers
   * ----------------------------------------------------------- */

  const handleDragStart = (taskId) => {
    setActiveDragTaskId(taskId);
  };

  const handleDragEnd = () => {
    setActiveDragTaskId(null);
  };

  const handleMoveTask = (taskId, targetColumnId) => {
    setActiveDragTaskId(null);

    // Defensive validation
    if (!taskId || !VALID_COLUMN_IDS.includes(targetColumnId)) {
      return;
    }

    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) {
        return prevTasks;
      }

      const currentTask = prevTasks[taskIndex];

      // If already in target column, no update needed
      if (currentTask.status === targetColumnId) {
        return prevTasks;
      }

      const targetCol = COLUMNS.find((col) => col.id === targetColumnId);
      setLiveAnnouncement(
        `Moved task "${currentTask.title}" to ${targetCol?.title || targetColumnId}`
      );

      const updatedTasks = [...prevTasks];
      updatedTasks[taskIndex] = {
        ...currentTask,
        status: targetColumnId
      };

      return updatedTasks;
    });
  };

  const handleDropTask = (draggedTaskId, targetColumnId) => {
    handleMoveTask(draggedTaskId, targetColumnId);
  };

  /* -------------------------------------------------------------
   * Task Activity / Comments Update Handler (Phase 3 Integration)
   * ----------------------------------------------------------- */

  const handleTaskUpdate = (taskId, updates) => {
    if (!taskId || !updates) return;

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              ...updates
            }
          : t
      )
    );
  };

  const handleSelectTask = (taskId) => {
    setSelectedTaskId(taskId);
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

  const handleSaveTask = ({ id, title, description, status, priority, dueDate }) => {
    if (id) {
      // Edit existing task: preserve existing column status, comments, and update fields
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === id
            ? {
                ...t,
                title,
                description,
                priority: priority || t.priority || DEFAULT_PRIORITY,
                dueDate: dueDate || null
              }
            : t
        )
      );
      setLiveAnnouncement(`Updated task "${title}"`);
    } else {
      // Create new task with sequential ID
      const newTaskId = generateNextTaskId(tasks);
      const newTask = {
        id: newTaskId,
        title,
        description,
        status: status || DEFAULT_COLUMN_ID,
        priority: priority || DEFAULT_PRIORITY,
        dueDate: dueDate || null,
        comments: []
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);
      setSelectedTaskId(newTaskId);
      setLiveAnnouncement(`Created new task "${title}"`);
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
    const taskToDelete = tasks.find((task) => task.id === deleteModal.taskId);
    if (taskToDelete) {
      setTasks((prevTasks) => {
        const remaining = prevTasks.filter((task) => task.id !== taskToDelete.id);
        if (selectedTaskId === taskToDelete.id) {
          setSelectedTaskId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
      setDeletedTask(taskToDelete);
      setLiveAnnouncement(`Deleted task "${taskToDelete.title}"`);

      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setDeletedTask(null);
        undoTimeoutRef.current = null;
      }, 5000);
    }
    handleCloseDeleteModal();
  };

  const handleUndoDelete = () => {
    if (!deletedTask) return;

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    const taskToRestore = deletedTask;
    setTasks((prevTasks) => [...prevTasks, taskToRestore]);
    setSelectedTaskId(taskToRestore.id);
    setLiveAnnouncement(`Restored deleted task "${taskToRestore.title}"`);
    setDeletedTask(null);
    undoTimeoutRef.current = null;
  };

  return (
    <div className="kanban-app">
      {/* Live Region for Screen Reader Announcements */}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

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
                Organize, track, and complete your tasks with seamless drag &amp; drop and keyboard navigation
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

        {/* 3-Column Grid */}
        <div className="kanban-columns-grid">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              activeDragTaskId={activeDragTaskId}
              selectedTaskId={selectedTaskId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropTask={handleDropTask}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleOpenDeleteModal}
              onQuickAddTask={handleOpenCreateModal}
              onSelectTask={handleSelectTask}
              onMoveTask={handleMoveTask}
            />
          ))}
        </div>

        {/* Task Activity & Notes Section (Phase 3 Integration) */}
        <section className="kanban-activity-section" aria-labelledby="activity-section-heading">
          <div className="kanban-activity-header">
            <div>
              <h2 id="activity-section-heading" className="kanban-activity-title">
                Task Notes &amp; Activity
              </h2>
              <p className="kanban-activity-subtitle">
                Select any task card above or use the selector below to view notes, timeline, and add comments
              </p>
            </div>
            {tasks.length > 0 && (
              <div className="kanban-activity-selector">
                <label htmlFor="activity-task-select" className="activity-selector-label">
                  Active Task:
                </label>
                <select
                  id="activity-task-select"
                  className="form-select activity-task-select"
                  value={selectedTask?.id || ''}
                  onChange={(e) => handleSelectTask(e.target.value)}
                  aria-label="Select active task for notes"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedTask ? (
            <div className="kanban-activity-body">
              <div className="selected-task-pill">
                <span className="selected-task-pill__label">Active Task:</span>
                <strong className="selected-task-pill__title">{selectedTask.title}</strong>
                <span className={`priority-badge priority-badge--${selectedTask.priority || 'medium'}`}>
                  {selectedTask.priority || 'medium'}
                </span>
                <span className="selected-task-pill__status">
                  Status: {COLUMNS.find((c) => c.id === selectedTask.status)?.title || selectedTask.status}
                </span>
              </div>
              <MessyTaskList
                task={selectedTask}
                onUpdate={handleTaskUpdate}
              />
            </div>
          ) : (
            <div className="kanban-activity-empty">
              <p>No tasks available to view activity. Create a task above to begin tracking notes.</p>
            </div>
          )}
        </section>
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

      {/* Undo Toast Notification */}
      {deletedTask && (
        <div className="undo-toast" role="status" aria-live="polite">
          <span>Task deleted.</span>
          <button type="button" className="undo-toast__button" onClick={handleUndoDelete}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
