import { useEffect, useState } from 'react';
import './List.css';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function List() {
  const [name, setName] = useState('New List');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetch(`/api/lists/${id}`)
      .then(res => res.json())
      .then(data => setName(data.name));
  }, [id]);

  async function addTodo() {
    if (!title.trim()) return;
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId: id, title }),
    });
    const { id: todoId } = await res.json();
    setTodos(t => [...t, { id: todoId, title, completed: false }]);
    setTitle('');
  }

  async function toggleTodo(todo: Todo, completed: boolean) {
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    setTodos(t => t.map(td => (td.id === todo.id ? { ...td, completed } : td)));
  }

  return (
    <main className="list">
      <h1>{name}</h1>
      <input
        type="text"
        placeholder="Add a todo"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') addTodo();
        }}
      />
      <ul>
        {todos.map(todo => (
          <li
            key={todo.id}
            className={`todo-item${todo.completed ? ' completed' : ''}`}
          >
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={e => toggleTodo(todo, e.target.checked)}
              />
              {todo.title}
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
