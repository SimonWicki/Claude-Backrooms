# Backrooms Principles

A room is a *bounded execution environment*.

Rooms define:
- what can be produced
- what cannot be produced
- how memory persists
- how failures accumulate
- how mutation is applied to future constraints

A successful system does not prevent all failures.
It surfaces failures as structure.

## Definitions

- **Room**: An execution boundary containing a manifest, a journal, and derived state.
- **Event Journal**: Append-only, line-oriented record of all interaction attempts.
- **Violation**: Output that crosses a forbidden boundary (e.g., speculation).
- **Entropy**: A scalar representing instability in the room.
- **Mutation**: The measured drift between the original ruleset and the current state.

## Invariants

- Journals are append-only.
- Sealed rooms cannot be entered.
- Forking copies constraints + inherits partial state.
- Entropy never decreases unless explicitly reset by an operator action.
