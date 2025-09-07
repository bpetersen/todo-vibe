import { useEffect, useState } from 'react';
import './List.css';

interface Todo {
  id: string;
  title: string;
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
    setTodos(t => [...t, { id: todoId, title }]);
    setTitle('');
  }

  return (
    <main className="list">
      <h1>{name}</h1>
      <input
        placeholder="Add a todo"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') addTodo();
        }}
      />
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </main>
  );
}
