# Knowledge & Technology: package handoff

The keeper's handoff is `E:/AI Programs/HQ/handoffs/knowledge/HANDOFF.md`. This file is for belt units: each unit
adds one dated line under Done, and parks a disagreement with DESIGN.md under Blocked.

## Done

- 2026-10-31: 2860 KD-1 static demonstration tests (`test/kd1-static.test.ts`) for KD-1a/e/f/h and determinism on the kd-1 fixture via `loadRecords`, `world.json`, stock and capability pure functions; gate passes. KD-1a `possible` parked under Blocked (brief vs fixture).

- 2026-10-31: 2858 implemented five independent capability predicates, Reality/Economy report ports, sorted batch states and field-level diffs, and public exports. All 20 capability tests pass; the requested gate passes 40 tests across capability/stock/fence plus tsc --noEmit. Missing diff pairs use unreported defaults (possible/deployed null; known/invented/adopted false); no recipe links yield possible null; invalid production shares throw. Port snapshots are supplied by the host, with no live engine integration in this unit.

- 2026-10-31: 2857 pure report-based stock, loss/regain events with sorted causes, read-port types, and Henrich copying-loss functions exported. DUP-61 (1), (2), (2a), (2b), (5) covered with explicitly fictional port stubs; gate tests and typecheck pass. Duplicate holder reports count each mind once per item (holds overrides heard_of); no_reader requires a previously readable intact record to survive unreadably in the same society/item. Implemented and verified, not integrated with live engine ports; aggregate/person-run equivalence remains outside this unit.

- 2026-10-31: 2856 record schemas, deterministic JSON loader, integrity checker/CLI, and source fence implemented with rule-specific tests. Filesystem I/O is isolated in scripts/files.ts, imported relatively by the loader to preserve the src import fence; loadRecords returns parallel unknown records and file diagnostics so invalid JSON remains checkable.

- 2026-10-31: package scaffolded by the Knowledge & Technology keeper (ids helper only).

## Blocked

- 2026-10-31 (2860): Task brief KD-1a asks for every capability state false in B on the stock fixture, but `fixtures/kd-1/world.json` reports B reach and feasibility true, so `capabilityState` correctly leaves `possible: true` (DESIGN §1.1). Test asserts empty B stock and false known/invented/adopted with `deployed: null`. Resolving the brief vs fixture needs a keeper change, not `src/`.
