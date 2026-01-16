# Ontology

Claude Backrooms uses a minimal ontology to keep the system inspectable.

## Entities

- Room
- Ruleset
- Event
- Derived State
- Graph Edge

## Event kinds

- enter
- output
- violation
- fork
- seal

## Rule sets

Rule sets are named collections of constraints.

Example: `archival_only`

- Allowed outputs: summaries, indexes
- Forbidden: speculation, creativity
- Memory: persistent
