# Knowledge & Technology: package handoff

The keeper's handoff is `E:/AI Programs/HQ/handoffs/knowledge/HANDOFF.md`. This file is for belt units: each unit
adds one dated line under Done, and parks a disagreement with DESIGN.md under Blocked.

## Done
- 2026-11-03 (5533, KN-1): Implemented versioned method alternatives with Kleene AND/OR and sorted producer-labelled unknowns; migrated production links (unversioned, KNT-12) and fixture links (fixture versions). KD-1 predicate expectations unchanged; only empty unknowns added to full-state assertions. Implemented, not integrated; connection validation waits on Economy/Reality recipe/process ids.
- 2026-11-01 (2987): Preserved artefact/record diffusion without living holders; added contactStart (default 0), mortality from time zero.
- 2026-11-01 (2942): isMedium authoritative for media availability; descriptors rejected on false flags; regression tests.
- 2026-11-01 (2941): rewrote `test/kd1-dynamic.test.ts` (KD-1c main, KD-1g by q only, KD-1h at fixed holder share); parked halves skipped.
- 2026-11-01 (2907): seeded aggregate KD-1 runner (`src/kd1.ts`).
- 2026-11-01 (2906): society media availability derived from deployment.
- 2026-11-01 (2905): aggregate invention hazard and Bass adoption.
- 2026-11-01 (2904): pure diffusion channel hazards.
- 2026-10-31 (2862): filesystem loader moved to scripts; fence test.
- 2026-10-31 (2857-2860): KD-1 static tests, capability predicates, stock and loss events, schemas, loader, checker.
- 2026-10-31: package scaffolded by the keeper.

## Resolved by the keeper (2026-11-01; DESIGN log)
- 2942 writing medium: no descriptor; user share = holders of the medium technique over population (DESIGN §1.8).
- 2860 KD-1a: B stays possible because the fixture gives B reach and feasibility; the test as written is correct.
- 2941 KD-1g advantage half and the dependence of q on tau: wait on research unit 2989 (forms with sources).

## Blocked
- 2026-11-03 (5534, KN-2): Parked under the task's explicit "No KD-1 expected value changes; if one would, stop" rule. `test/kd1-static.test.ts:59-72` requires B's stock to be empty and its known predicate to be false. KN-2 replaces known with three-valued availability: a missing technique/proposition pair has no confirmed absence, so B's availability would be null, not false. The fixture supplies population totals but no reported-minds snapshot or simulation tick; population alone cannot prove full coverage. The runner likewise constructs snapshots without reporting coverage (`src/kd1.ts:125-128`). Keeper decision needed: authorize KD-1 unknown expectations, or specify explicit complete-snapshot/negative-item evidence and how capability receives it while retaining the empty-stock assertion. No production or test changes made; do not preserve false by silently treating missing stock as complete coverage. KN-2 implementation and connection validation remain undone.
- 2026-11-01 (2942): knowledge/technique.writing (data/techniques/writing.json) has isMedium true but no medium descriptor; kind and literacy-based user share remain unknown pending keeper metadata.
- 2026-11-01 (2941): KD-1g cost-advantage half skipped: no knob maps cost advantage to adoption speed (adopters only gates on > 0); contact half runs via adoption.q.
- 2026-11-01 (2907): KD-1e/f runner tests deferred per task's keeper-decision hold. No generation/copying window is assumed (DESIGN §1.2 leaves it open); agent/aggregate equivalence and remaining case acceptance tests await later tasks. The runner models first method acquisition with one B representative, fixed records/readers and source-only mortality; it does not model cohort growth or live ports.
- 2026-10-31 (2860): Task brief KD-1a asks for every capability state false in B on the stock fixture, but `fixtures/kd-1/world.json` reports B reach and feasibility true, so `capabilityState` correctly leaves `possible: true` (DESIGN §1.1). Test asserts empty B stock and false known/invented/adopted with `deployed: null`. Resolving the brief vs fixture needs a keeper change, not `src/`.
