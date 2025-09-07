# todo-vibe

A clean, event-driven Todo application built with test-driven development (TDD). Commands trigger state changes and publish domain events. All data is stored in the browser's local storage—no database or server is required.

See [AGENTS.md](AGENTS.md) for collaboration guidelines and event-driven/TDD conventions. Domain events are documented in [EVENTS.md](EVENTS.md).

## Getting Started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Run tests:

   ```sh
   npm test
   ```

3. Start the web app:

   ```sh
   npm run dev
   ```

Open the browser at the URL printed in the console to create lists and todos. Data persists locally in your browser between sessions.
