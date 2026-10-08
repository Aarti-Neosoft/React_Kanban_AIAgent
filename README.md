# Kanban Task Board (Phases 1, 2 & 3)

A modern, responsive, and accessible Kanban task management application built with **React 18** and **Vite**, featuring **native HTML5 Drag and Drop**, **full keyboard accessibility**, **task activity tracking**, **due dates & overdue handling**, **undo deletion**, and **resilient browser localStorage** persistence.

This project was built following senior frontend engineering standards as part of an AI Agent comparison assignment (AntiGravity vs Codex), progressively delivered across three phases.

---

## 🚀 Key Features by Phase

### Phase 1: Core Kanban Board
* **Three Lifecycle Columns:**
  * **To Do** (`todo` - blue accent)
  * **In Progress** (`in-progress` - amber accent)
  * **Done** (`done` - emerald accent)
* **Task CRUD Management:**
  * **Create Task:** Add new tasks with title, optional description, priority selection (High, Medium, Low), and column placement.
  * **Edit Task:** Modify task title, description, and priority while preserving its column status and notes history.
  * **Delete Confirmation Modal:** Accessible dialog with autofocus, Escape-key dismiss, and backdrop click prevention before deletion.
* **Priority Management & Filtering:**
  * Visual priority badges for High (red), Medium (amber), and Low (green).
  * Filter bar with live counters (`All`, `High`, `Medium`, `Low`) and a quick Reset button.
* **Native HTML5 Drag and Drop:**
  * Native browser DnD API (zero external drag dependencies).
  * Smooth drag styling, grab/grabbing cursors, visual drop indicators, and event isolation on action buttons (`stopPropagation`).
* **Resilient localStorage Persistence:**
  * Auto-syncs to `kanban_tasks` on any state update.
  * Schema validation and graceful fallback to initial sample tasks on parse errors or corrupted data.
  * Safe sequential task ID generator (`generateNextTaskId`).

### Phase 2: Enhanced Task Management
* **Calendar Due Dates & Overdue Detection:**
  * Task creation and editing forms support setting calendar due dates (`YYYY-MM-DD`).
  * Timezone-safe local date comparison logic (`dates.js`) prevents off-by-one errors across timezones.
  * Overdue tasks automatically display a prominent red border and "OVERDUE" status badge (only while not in "Done").
* **Undo Delete Notification:**
  * Deleting a task triggers a non-intrusive bottom-right toast notification.
  * 5-second countdown with immediate "Undo" capability restoring the task and its comments.
  * Clean timer management (`undoTimeoutRef`) preventing memory leaks on unmount.

### Phase 3: Task Activity Integration & Accessibility
* **Task Activity & Notes Integration (`MessyTaskList`):**
  * Seamlessly integrated activity timeline component below the Kanban board.
  * Active task selection: select any card on the board or use the synchronized task selector dropdown.
  * Real-time session duration counter (`secondsActive`) tracking how long the user has been viewing the timeline.
  * Add timestamped activity notes and comments to any task with Enter-key or button submission.
  * Comments are immutably appended, stored per task, and automatically persisted to `localStorage`.
  * Visual comment count badge on task cards (`💬 N notes`) for at-a-glance visibility.
* **Full Keyboard Accessibility:**
  * **Arrow Key Navigation:** Focused cards can be moved between columns instantly using `ArrowLeft` (previous column) and `ArrowRight` (next column).
  * **Card Selection:** Press `Enter` or `Space` on a focused card to select it for the activity timeline.
  * **Accessible Move Buttons:** Dedicated `← Move` and `Move →` buttons on each card for keyboard users navigating via Tab, with disabled states at column boundaries.
  * **Screen Reader Live Announcements:** WAI-ARIA `role="status"` live region (`aria-live="polite"`) announcing task moves, creations, updates, and deletions.
  * **Independent Controls:** Move, Edit, and Delete buttons are strictly isolated to prevent accidental drag or click conflicts.
  * **Semantic Labels:** Card drag indicator tooltip updated to "Drag to move column" accurately matching application behavior.

---

## 📁 Project Structure

```text
Neosoft_kanban_AIAgent/
├── .agents/
│   └── rules/
│       └── senior-frontend-guidelines.md   # Senior frontend standards & instructions
├── dist/                                   # Production build output
├── src/
│   ├── components/
│   │   ├── DeleteConfirmModal.jsx          # Accessible task deletion confirmation modal
│   │   ├── KanbanBoard.jsx                 # Board coordinator, filters, DnD, keyboard movement & activity
│   │   ├── KanbanColumn.jsx                # Lifecycle column & HTML5 drop zone
│   │   ├── MessyTaskList.jsx               # Task notes timeline, session timer & comment posting (Phase 3)
│   │   ├── TaskCard.jsx                    # Accessible draggable task card with keyboard & move controls
│   │   └── TaskForm.jsx                    # Accessible task create & edit modal dialog
│   ├── constants/
│   │   └── columns.js                      # Column metadata, priority tokens & storage keys
│   ├── utils/
│   │   ├── dates.js                        # Timezone-safe calendar date comparison & formatting
│   │   └── storage.js                      # Safe localStorage load/save & sequential ID generation
│   ├── App.jsx                             # Clean application root component
│   ├── index.css                           # Design tokens, responsive grid, animations & utility classes
│   └── main.jsx                            # React 18 DOM mount point
├── index.html                              # HTML5 template with Inter typography
├── package.json                            # Minimal dependencies (React 18 + Vite)
├── package-lock.json                       # Dependency lockfile
├── vite.config.js                          # Vite build configuration
├── PROMPT_AND_COMPARISON_LOG.md            # AI Agent comparison log & evaluation report
└── README.md                               # Comprehensive documentation
```

---

## 🛠️ Architecture & Data Flow

### 1. Dual Movement Mechanics (Drag-and-Drop + Keyboard)

```text
MOUSE INTERACTION (HTML5 Drag and Drop):
User drags <TaskCard> ──► onDragStart: dataTransfer.setData('text/plain', taskId)
                      ──► Column onDragOver: e.preventDefault()
                      ──► Column onDrop: dataTransfer.getData('text/plain')
                      ──► handleMoveTask(taskId, targetColumnId)

KEYBOARD INTERACTION:
User tabs to <TaskCard> (tabIndex=0)
  ├── Press ArrowRight ──► Moves to next column if available
  ├── Press ArrowLeft  ──► Moves to previous column if available
  ├── Press Enter/Space──► Selects task for Activity Timeline
  └── Tab to Move buttons ──► Enter on "← Move" or "Move →"
                       ──► handleMoveTask(taskId, targetColumnId)
                       ──► Announces via aria-live: "Moved task X to In Progress"
```

### 2. State & Persistence Pipeline

```text
[Browser localStorage: "kanban_tasks"]
             ▲                          │
             │ saveTasksToStorage       │ loadTasksFromStorage
             │                          ▼
     [KanbanBoard State] ◄──── Tasks Array with { id, title, status, priority, dueDate, comments }
             │
             ├── Selected Task ID ──► <MessyTaskList task={selectedTask} onUpdate={handleTaskUpdate} />
             │                              │
             │                              ▼ (User posts comment)
             │                        onUpdate(taskId, { comments, commentCount })
             │                              │
             └──────────────────────────────┘
                    (State updates immutably ──► auto-persists to localStorage)
```

---

## 💻 Running the Application Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` (or the port displayed in your terminal).

### 3. Build for Production
```bash
npm run build
```
Generates optimized static assets into the `dist/` directory.

---

## ✅ Quality & Verification Checklist

* [x] **Task Creation:** Add tasks with title, description, priority, and optional due date.
* [x] **Task Editing:** Update task details while preserving existing column status and comment history.
* [x] **Task Deletion & Undo:** Accessible modal confirmation followed by a 5-second Undo notification toast.
* [x] **HTML5 Drag and Drop:** Drag cards smoothly between To Do, In Progress, and Done.
* [x] **Keyboard Navigation:** Move tasks between columns using Left/Right arrow keys or explicit move buttons.
* [x] **Due Dates & Overdue:** Calendar validation and prominent overdue badges for late tasks.
* [x] **Priority Filtering:** Filter tasks by All, High, Medium, or Low with live counter pills.
* [x] **Phase 3 Activity Integration:** Add and view notes/comments per task with real-time session timer.
* [x] **Data Persistence:** All task creations, edits, column moves, and activity comments persist across page refreshes.
* [x] **Senior Standards & Cleanup:** Unused exports removed, drag tooltip wording corrected, no misleading performance claims.
