# Kanban Task Board (Phase 1)

A clean, responsive, and accessible Kanban task management board built with **React** and **Vite**, using **native HTML5 Drag and Drop** and **browser localStorage** persistence.

This project was built following senior frontend engineering standards as Phase 1 of an AI Agent comparison assignment, designed to be lightweight, modular, and easy to extend in Phase 2.

---

## 🚀 Features

* **Three Standard Columns:**
  * **To Do** (`todo`)
  * **In Progress** (`in-progress`)
  * **Done** (`done`)
* **Task Management & Priority:**
  * **Create Task:** Add new tasks with title, optional description, priority selection (High, Medium, Low), and automatic validation.
  * **Edit Task:** Edit task title, description, and priority while preserving its current column status.
  * **Priority Badges:** Distinct visual color badges for High (red), Medium (amber), and Low (emerald) priority.
  * **Priority Filter:** Interactive filter bar to filter tasks by `All`, `High`, `Medium`, or `Low` with live counters.
  * **Delete Task:** Clean, accessible confirmation dialog before task removal to prevent accidental deletion.
* **Native HTML5 Drag and Drop:**
  * Draggable task cards with clear visual cues (grab cursor, drag indicator, active dragging opacity).
  * Interactive drop zones on columns with highlight feedback and drop indicators.
  * Seamless moving between all columns in any direction (`To Do` ↔ `In Progress` ↔ `Done`).
  * Action buttons (Edit/Delete) are event-isolated so dragging never accidentally triggers edits or deletions.
* **Resilient localStorage Persistence:**
  * Auto-saves board state to `kanban_tasks` upon any change (create, edit, delete, move).
  * Safe JSON parsing with fallback to initial sample tasks if data is missing, corrupted, or malformed.
  * Automatic state restoration on page reload.
* **Accessible & Responsive UI:**
  * Semantic HTML (`<main>`, `<section>`, `<article>`, `<header>`, `<dialog>`).
  * Visible focus indicators for keyboard navigation and modal dialogs with Escape key closing and backdrop dismiss.
  * Responsive layout adapting from multi-column desktop grids to tablet and mobile screens.

---

## 📁 Project Structure

```text
Neosoft_kanban_AIAgent/
├── .agents/                    # Workspace agent rules & configurations
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── DeleteConfirmModal.jsx  # Accessible delete confirmation dialog
│   │   ├── KanbanBoard.jsx         # Board state manager, stats, & DnD coordinator
│   │   ├── KanbanColumn.jsx        # Column container & HTML5 drop zone
│   │   ├── TaskCard.jsx            # Draggable task card with action handlers
│   │   └── TaskForm.jsx            # Create and Edit task modal dialog
│   ├── constants/
│   │   └── columns.js              # Column configurations & storage keys
│   ├── utils/
│   │   └── storage.js              # Safe localStorage load/save & sequential ID generation (`generateNextTaskId`)
│   ├── App.jsx                     # Top-level composition component
│   ├── index.css                   # Design tokens, CSS variables, & responsive styles
│   └── main.jsx                    # React 18 DOM mount point
├── index.html                      # HTML template with meta tags & Inter typography
├── package.json                    # Minimal dependencies (React 18 + Vite)
├── vite.config.js                  # Vite configuration with React plugin
└── README.md                       # Comprehensive documentation
```

---

## 🛠️ Architecture & Mechanics

### 1. Native HTML5 Drag and Drop

The drag-and-drop mechanism is implemented using zero external libraries:

```text
User initiates drag on <TaskCard>
   │ (onDragStart) -> Sets dataTransfer.setData('text/plain', taskId)
   │               -> Sets dataTransfer.effectAllowed = 'move'
   │               -> Emits onDragStart(taskId) to apply visual dragging styles
   ▼
User hovers over a <KanbanColumn>
   │ (onDragOver)  -> Calls e.preventDefault() to mark as valid drop target
   │ (onDragEnter) -> Adds 'kanban-column--drag-over' visual indicator
   │ (onDragLeave) -> Clears visual indicator when cursor leaves container
   ▼
User releases over destination column
   │ (onDrop)      -> Retrieves taskId via e.dataTransfer.getData('text/plain')
   │               -> Validates taskId and destination column
   │               -> Updates task.status in React state
   │               -> Syncs updated array to localStorage
   ▼
Destination column re-renders immediately with the moved task
```

### 2. State & localStorage Persistence

* **Key:** `kanban_tasks`
* **Safe Reading (`loadTasksFromStorage`):**
  * Reads raw data inside a `try/catch` block.
  * Parses JSON and validates each task object against expected schema (`id`, `title`, `description`, `status`).
  * If localStorage is empty or contains malformed data, gracefully falls back to `INITIAL_SAMPLE_TASKS`.
* **Safe Writing (`saveTasksToStorage`):**
  * Automatically synced inside `useEffect` on `tasks` change.
  * Wrapped in `try/catch` to guard against quota limits or private-browsing restrictions.

### 3. Task Structure

```javascript
{
  id: "task-1",                    // Unique string identifier (not array index)
  title: "Example task",          // Non-empty string
  description: "Task details",    // String (optional)
  status: "todo",                 // "todo" | "in-progress" | "done"
  priority: "high"                // "high" | "medium" | "low"
}
```

---

## 💻 Running the Application Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start the Vite development server

```bash
npm run dev
```

The application will be served at `http://localhost:3000`.

### 3. Build for production

```bash
npm run build
```

---

## ✅ Verification Checklist

* [x] **Task Creation:**
  * Created task with title and description.
  * Appears in "To Do" column by default.
  * Empty / whitespace title triggers error message and blocks submission.
* [x] **Task Editing:**
  * Clicking "Edit" opens modal with existing title and description pre-filled.
  * Saves changes while preserving the task's existing column.
* [x] **Task Deletion:**
  * Clicking "Delete" opens confirmation dialog.
  * Confirming deletion removes task from state and updates localStorage immediately.
* [x] **Drag and Drop:**
  * Drag To Do → In Progress.
  * Drag In Progress → Done.
  * Drag Done → To Do.
  * Move same task multiple times across columns.
  * Actions buttons isolated from drag gestures.
* [x] **Persistence:**
  * Page refresh retains created, edited, moved, and deleted tasks.
  * Malformed data in localStorage resets gracefully without crashing.
* [x] **UI & Accessibility:**
  * Clean 3-column layout with status indicators and task counters.
  * Empty state graphic and text when a column has zero tasks.
  * Keyboard navigation and Escape-key dismiss on modals.
  * Responsive layout across desktop, tablet, and mobile viewports.
