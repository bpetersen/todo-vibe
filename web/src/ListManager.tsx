import { useEffect, useState } from 'react';
import './ListManager.css';

interface List {
  id: string;
  name: string;
  todos: { completed: boolean }[];
  createdAt: string;
  archived?: boolean;
}

export default function ListManager() {
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    const loaded: List[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('list:')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list = JSON.parse(raw);
          if (!list.archived) loaded.push(list);
        }
      }
    }
    loaded.sort(
      (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
    );
    setLists(loaded);
  }, []);

  function createList() {
    const name = window.prompt('List name?') ?? 'New List';
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const list: List = { id, name, todos: [], createdAt, archived: false };
    localStorage.setItem(`list:${id}`, JSON.stringify(list));
    setLists(prev => [...prev, list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  }

  function renameList(id: string) {
    const list = lists.find(l => l.id === id);
    if (!list) return;
    const name = window.prompt('New name?', list.name);
    if (!name) return;
    const updated = { ...list, name };
    localStorage.setItem(`list:${id}`, JSON.stringify(updated));
    setLists(prev => prev.map(l => (l.id === id ? updated : l)));
  }

  function archiveList(id: string) {
    const list = lists.find(l => l.id === id);
    if (!list) return;
    if (!window.confirm('Archive this list?')) return;
    const updated = { ...list, archived: true };
    localStorage.setItem(`list:${id}`, JSON.stringify(updated));
    setLists(prev => prev.filter(l => l.id !== id));
  }

  return (
    <main className="list-manager">
      <h1>Your Lists</h1>
      <button className="new-list-button" onClick={createList}>
        New list
      </button>
      <ul className="list-cards">
        {lists.map(list => {
          const completed = list.todos.filter(t => t.completed).length;
          const total = list.todos.length;
          return (
            <li key={list.id} className="list-card">
              <a href={`/lists/${list.id}`}>{list.name}</a>
              <span className="counts">
                {completed}/{total}
              </span>
              <div className="actions">
                <button onClick={() => renameList(list.id)}>Rename</button>
                <button onClick={() => archiveList(list.id)}>Archive</button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
