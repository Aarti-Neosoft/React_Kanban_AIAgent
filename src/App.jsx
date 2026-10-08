import React from 'react';
import KanbanBoard from './components/KanbanBoard';

/**
 * Root Application Component
 * Coordinates the top-level application wrapper and renders the main KanbanBoard.
 */
export default function App() {
  return (
    <div className="app-root">
      <KanbanBoard />
    </div>
  );
}
