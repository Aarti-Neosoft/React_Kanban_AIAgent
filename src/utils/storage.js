import { STORAGE_KEY, VALID_COLUMN_IDS, VALID_PRIORITIES, DEFAULT_PRIORITY } from '../constants/columns';

/**
 * Initial sample tasks loaded if localStorage is empty or uninitialized.
 */
export const INITIAL_SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Research competitor Kanban boards',
    description: 'Analyze UX flow, drag-and-drop mechanics, and column structures.',
    status: 'todo',
    priority: 'high'
  },
  {
    id: 'task-2',
    title: 'Design clean responsive layout',
    description: 'Implement modern card styling, subtle borders, and column counters.',
    status: 'in-progress',
    priority: 'medium'
  },
  {
    id: 'task-3',
    title: 'Setup React + Vite project',
    description: 'Configure standard Vite project structure and build scripts.',
    status: 'done',
    priority: 'low'
  }
];

/**
 * Generates the next sequential task ID based on existing tasks.
 *
 * Rules:
 * - Looks only at IDs matching /^task-(\d+)$/
 * - Extracts the numeric portions
 * - Finds the maximum numeric value
 * - Returns `task-${max + 1}`
 * - Returns `task-1` when there are no sequential task IDs
 * - Ignores UUID-style IDs
 *
 * @param {Array<{id: string}>} [tasks=[]] - Current list of tasks
 * @returns {string} The next sequential task ID (e.g. 'task-4')
 */
export const generateNextTaskId = (tasks = []) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 'task-1';
  }

  const sequentialPattern = /^task-(\d+)$/;
  let maxNumber = 0;
  let foundSequentialId = false;

  for (const task of tasks) {
    if (!task || typeof task.id !== 'string') {
      continue;
    }

    const match = task.id.match(sequentialPattern);
    if (match) {
      const numericPart = parseInt(match[1], 10);
      if (!Number.isNaN(numericPart)) {
        foundSequentialId = true;
        if (numericPart > maxNumber) {
          maxNumber = numericPart;
        }
      }
    }
  }

  return foundSequentialId ? `task-${maxNumber + 1}` : 'task-1';
};

/**
 * Backward compatibility alias for generateNextTaskId.
 */
export const generateTaskId = (tasks) => generateNextTaskId(tasks);

/**
 * Validates whether an individual task object satisfies the required structure.
 * Gracefully accepts tasks without priority for backward compatibility.
 * @param {any} task
 * @returns {boolean}
 */
const isValidTask = (task) => {
  return (
    task !== null &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    task.id.trim().length > 0 &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    VALID_COLUMN_IDS.includes(task.status) &&
    (task.priority === undefined || typeof task.priority === 'string')
  );
};

/**
 * Loads tasks safely from browser localStorage.
 * Falls back to initial sample tasks if empty, unparseable, or invalid.
 * Gracefully ensures all tasks have a valid priority.
 * @returns {Array<{id: string, title: string, description: string, status: string, priority: string}>}
 */
export const loadTasksFromStorage = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return INITIAL_SAMPLE_TASKS;
    }

    const parsed = JSON.parse(rawData);

    if (Array.isArray(parsed)) {
      // Filter out any corrupted objects and normalize priority
      const sanitized = parsed.filter(isValidTask).map((task) => ({
        ...task,
        priority: VALID_PRIORITIES.includes(task.priority) ? task.priority : DEFAULT_PRIORITY
      }));
      return sanitized;
    }

    console.warn(`[Kanban] Stored data under "${STORAGE_KEY}" was not an array. Resetting to defaults.`);
    return INITIAL_SAMPLE_TASKS;
  } catch (error) {
    console.error(`[Kanban] Failed to read from localStorage:`, error);
    return INITIAL_SAMPLE_TASKS;
  }
};

/**
 * Persists tasks safely to browser localStorage.
 * @param {Array<object>} tasks
 */
export const saveTasksToStorage = (tasks) => {
  try {
    if (!Array.isArray(tasks)) {
      console.error('[Kanban] Attempted to save non-array tasks to localStorage.');
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error(`[Kanban] Failed to write to localStorage:`, error);
  }
};
