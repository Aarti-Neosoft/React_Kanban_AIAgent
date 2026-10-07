import React from 'react';
import KanbanBoard from './components/KanbanBoard';
import MessyTaskList from './components/MessyTaskList';

export default function App() {
  return (
    <div className="app-root">
      <KanbanBoard />
      <hr />
      <MessyTaskList />
    </div>
  );
}
