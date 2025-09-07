# todo-vibe

A clean, event-driven Todo application built with test-driven development (TDD). Commands trigger state changes and publish domain events.

See [AGENTS.md](AGENTS.md) for collaboration guidelines and event-driven/TDD conventions.
Domain events are documented in [EVENTS.md](EVENTS.md).

## Getting Started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Run tests:

   ```sh
   npm test
   ```

Once you're set up, use TDD to drive new features and model behavior with events.

## API

### `POST /api/lists`

Creates a new list and responds with its identifier.

```sh
curl -X POST http://localhost:3000/api/lists
# => { "id": "abc123" }
```
