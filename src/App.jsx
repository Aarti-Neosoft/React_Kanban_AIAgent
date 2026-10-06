import React from 'react';
import KanbanBoard from './components/KanbanBoard';

/**
 * Root Application Component
 * Provides top-level layout wrapper and renders the main KanbanBoard.
 */
export default function App() {
  return (
    <div className="app-root">
      <KanbanBoard />
    </div>
  );
}
