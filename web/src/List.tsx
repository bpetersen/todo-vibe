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
    const stored = localStorage.getItem(`list:${id}`);
    if (stored) {
      const list = JSON.parse(stored);
      setName(list.name);
      setTodos(list.todos || []);
    }
  }, [id]);

  async function addTodo() {
    if (!title.trim()) return;
    const todoId = crypto.randomUUID();
    const newTodo = { id: todoId, title, completed: false };
    const stored = localStorage.getItem(`list:${id}`);
    const list = stored ? JSON.parse(stored) : { id, name, todos: [] };
    list.todos.push(newTodo);
    localStorage.setItem(`list:${id}`, JSON.stringify(list));
    setTodos(t => [...t, newTodo]);
    setTitle('');
  }

  async function toggleTodo(todo: Todo, completed: boolean) {
    const stored = localStorage.getItem(`list:${id}`);
    if (!stored) return;
    const list = JSON.parse(stored);
    list.todos = list.todos.map((td: Todo) =>
      td.id === todo.id ? { ...td, completed } : td
    );
    localStorage.setItem(`list:${id}`, JSON.stringify(list));
    setTodos(list.todos);
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
