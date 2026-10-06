/**
 * Kanban board column definitions and constants.
 * Represents the three core lifecycle states of tasks.
 */
export const COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    description: 'Tasks ready to be started',
    accentColor: '#3b82f6', // subtle blue
    emptyText: 'No tasks to do. Click "+ Add Task" to get started.'
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    description: 'Tasks currently in development',
    accentColor: '#f59e0b', // subtle amber
    emptyText: 'No tasks in progress. Drag tasks here to begin working.'
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Completed tasks',
    accentColor: '#10b981', // subtle emerald
    emptyText: 'No completed tasks yet. Finish a task and drop it here!'
  }
];

export const VALID_COLUMN_IDS = COLUMNS.map((col) => col.id);

export const DEFAULT_COLUMN_ID = 'todo';

export const STORAGE_KEY = 'kanban_tasks';

/**
 * Task priority definitions.
 * Allowed values: 'high', 'medium', 'low'.
 */
export const PRIORITIES = [
  { id: 'high', label: 'High', color: '#ef4444' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'low', label: 'Low', color: '#10b981' }
];

export const VALID_PRIORITIES = PRIORITIES.map((p) => p.id);

export const DEFAULT_PRIORITY = 'medium';
