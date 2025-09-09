import { useEffect, useState, useRef } from 'react';
import './List.css';
import { CreateTodo } from '../../src/domain/todo/CreateTodo';
import { CompleteTodo } from '../../src/domain/todo/CompleteTodo';
import { ReopenTodo } from '../../src/domain/todo/ReopenTodo';
import { ReorderTodo } from '../../src/domain/todo/ReorderTodo';
import type { TodoEvent } from '../../src/domain/todo/events';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  events: TodoEvent[];
}

export default function List() {
  const [name, setName] = useState('New List');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const originalOrder = useRef<Todo[]>([]);
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    const stored = localStorage.getItem(`list:${id}`);
    if (stored) {
      const list = JSON.parse(stored);
      setName(list.name);
      setTodos((list.todos || []).map((t: Todo) => ({ ...t, events: t.events || [] })));
    }
  }, [id]);

  async function addTodo() {
    if (!title.trim()) return;
    const todoId = crypto.randomUUID();
    const events = CreateTodo({ todoId, title, createdAt: new Date() });
    const newTodo: Todo = { id: todoId, title, completed: false, events };
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
    list.todos = list.todos.map((td: Todo) => {
        if (td.id !== todo.id) return td;
        const events = td.events || [];
        if (completed) {
          const newEvents = CompleteTodo({
            todoId: td.id,
            completedAt: new Date(),
            history: events,
          });
          return { ...td, completed: true, events: [...events, ...newEvents] };
        } else {
          const newEvents = ReopenTodo({ todoId: td.id, reopenedAt: new Date(), history: events });
          return { ...td, completed: false, events: [...events, ...newEvents] };
        }
    });
    localStorage.setItem(`list:${id}`, JSON.stringify(list));
    setTodos(list.todos);
  }

  function handleDragOver(toIndex: number) {
    if (dragIndex === null || dragIndex === toIndex) return;
    const updated = [...todos];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTodos(updated);
    setDragIndex(toIndex);
  }

  function handleDrop() {
    if (dragIndex === null) return;
    const history: TodoEvent[] = originalOrder.current.map(t => ({
      type: 'TodoCreated',
      data: { todoId: t.id, title: t.title, createdAt: new Date() },
    }));
    const events = ReorderTodo({ todoId: todos[dragIndex].id, toIndex: dragIndex, history });
    if (events.length === 0) {
      setTodos(originalOrder.current);
      setDragIndex(null);
      originalOrder.current = [];
      return;
    }
    const updated = [...todos];
    updated[dragIndex] = {
      ...updated[dragIndex],
      events: [...(updated[dragIndex].events || []), ...events],
    };
    const stored = { id, name, todos: updated };
    localStorage.setItem(`list:${id}`, JSON.stringify(stored));
    setTodos(updated);
    setDragIndex(null);
    originalOrder.current = [];
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
        {todos.map((todo, i) => (
          <li
            key={todo.id}
            className={`todo-item${todo.completed ? ' completed' : ''}${dragIndex === i ? ' dragging' : ''}`}
            draggable
            onDragStart={() => {
              originalOrder.current = todos;
              setDragIndex(i);
            }}
            onDragOver={e => {
              e.preventDefault();
              handleDragOver(i);
            }}
            onDrop={handleDrop}
            onDragEnd={() => setDragIndex(null)}
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
