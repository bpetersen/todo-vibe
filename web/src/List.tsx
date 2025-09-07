import { useEffect, useState } from 'react';
import './List.css';

export default function List() {
  const [name, setName] = useState('New List');

  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    fetch(`/api/lists/${id}`)
      .then(res => res.json())
      .then(data => setName(data.name));
  }, []);

  return (
    <main className="list">
      <h1>{name}</h1>
      <input placeholder="Add a todo" />
      <ul></ul>
    </main>
  );
}
