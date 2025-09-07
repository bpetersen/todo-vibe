import './App.css';

export default function App() {
  async function createList() {
    const name = window.prompt('List name?') ?? 'New List';
    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const { id } = await response.json();
    window.location.assign(`/lists/${id}`);
  }

  return (
    <main className="intro">
      <h1>Todo Vibe</h1>
      <p className="tagline">Organize your tasks with style</p>
      <button className="start-button" onClick={createList}>
        Start a new list
      </button>
    </main>
  );
}
