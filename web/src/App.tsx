import { useState } from 'react';
import './App.css';
import FeedbackFooter from './FeedbackFooter';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  async function createList() {
    const name = window.prompt('List name?') ?? 'New List';
    const id = crypto.randomUUID();
    const list = {
      id,
      name,
      todos: [],
      createdAt: new Date().toISOString(),
      archived: false,
    };
    localStorage.setItem(`list:${id}`, JSON.stringify(list));
    window.location.assign(`/lists/${id}`);
  }

  function exportState() {
    const lists = [] as unknown[];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('list:')) {
        const item = localStorage.getItem(key);
        if (item) {
          lists.push(JSON.parse(item));
        }
      }
    }
    const blob = new Blob([JSON.stringify(lists)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todo-state.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="intro">
      <button
        className="menu-button"
        aria-label="Menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>
      {menuOpen && (
        <div className="menu">
          <button className="menu-item" onClick={exportState}>
            Export state
          </button>
        </div>
      )}
      <h1>Todo Vibe</h1>
      <p className="tagline">Organize your tasks with style</p>
      <button className="start-button" onClick={createList}>
        Start a new list
      </button>
      <a href="/lists">View lists</a>
      <FeedbackFooter />
    </main>
  );
}
