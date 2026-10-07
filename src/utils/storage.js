import { STORAGE_KEY, VALID_COLUMN_IDS, VALID_PRIORITIES, DEFAULT_PRIORITY } from '../constants/columns';
import { isDateOnly } from './dates';

/**
 * Initial sample tasks loaded if localStorage is empty or uninitialized.
 */
export const INITIAL_SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Research competitor Kanban boards',
    description: 'Analyze UX flow, drag-and-drop mechanics, and column structures.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-08'
  },
  {
    id: 'task-2',
    title: 'Design clean responsive layout',
    description: 'Implement modern card styling, subtle borders, and column counters.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2026-10-09'
  },
  {
    id: 'task-3',
    title: 'Setup React + Vite project',
    description: 'Configure standard Vite project structure and build scripts.',
    status: 'done',
    priority: 'low',
    dueDate: '2026-10-05'
  },
  {
    id: 'task-4',
    title: 'Create Kanban board columns',
    description: 'Build Todo, In Progress, and Done columns with responsive layouts.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-10'
  },
  {
    id: 'task-5',
    title: 'Implement drag and drop',
    description: 'Allow users to move task cards between different Kanban columns.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-10-11'
  },
  {
    id: 'task-6',
    title: 'Add task creation form',
    description: 'Create a form to add new tasks with title, description, priority, and due date.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-12'
  },
  {
    id: 'task-7',
    title: 'Implement task editing',
    description: 'Allow users to edit existing task details and update task information.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-13'
  },
  {
    id: 'task-8',
    title: 'Add task delete functionality',
    description: 'Implement task deletion with a confirmation message and undo option.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-10-14'
  },
  {
    id: 'task-9',
    title: 'Implement due date handling',
    description: 'Display task due dates and highlight overdue tasks for better tracking.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-15'
  },
  {
    id: 'task-10',
    title: 'Add task filtering',
    description: 'Allow users to filter tasks based on status, priority, and due date.',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-10-16'
  },
  {
    id: 'task-11',
    title: 'Add search functionality',
    description: 'Implement task search by title and description with instant filtering.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2026-10-17'
  },
  {
    id: 'task-12',
    title: 'Improve mobile responsiveness',
    description: 'Optimize the Kanban board for mobile, tablet, and desktop screen sizes.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-18'
  },
  {
    id: 'task-13',
    title: 'Add priority indicators',
    description: 'Display visual priority indicators for high, medium, and low priority tasks.',
    status: 'done',
    priority: 'low',
    dueDate: '2026-10-07'
  },
  {
    id: 'task-14',
    title: 'Implement local storage',
    description: 'Persist Kanban tasks in browser local storage so data remains after refresh.',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-10-19'
  },
  {
    id: 'task-15',
    title: 'Test and fix Kanban board',
    description: 'Perform functional testing, identify UI issues, and fix bugs before final delivery.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-20'
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
 * Gracefully accepts tasks without priority or dueDate for backward compatibility.
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
 * Gracefully ensures all tasks have a valid priority and a nullable due date.
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
        priority: VALID_PRIORITIES.includes(task.priority) ? task.priority : DEFAULT_PRIORITY,
        dueDate: isDateOnly(task.dueDate) ? task.dueDate : null
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
