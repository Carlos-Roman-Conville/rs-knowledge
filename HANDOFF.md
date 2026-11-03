# Knowledge & Technology: package handoff

The keeper's handoff is `E:/AI Programs/HQ/handoffs/knowledge/HANDOFF.md`. This file is for belt units: each unit
adds one dated line under Done, and parks a disagreement with DESIGN.md under Blocked.

## Done
- 2026-11-03 (5536, KN-4): Audited the capability-state migration and parked it under Blocked as explicitly required when a KD-1 expected value would change. No production code, fixtures or test expectations changed.
- 2026-11-03 (5535, KN-3): Implemented per-record AccessReport counting with eligible Society roster readers, Kleene access/interpretation, distinct record counts and owner-labelled unknowns. Missing access is unknown; confirmed loss uses no_access. Records never supply holders or skill. KNT-14 remains explicitly labelled fixture access in KD-1 stubs; numerical/predicate expectations unchanged (required cause rename only). Implemented, not integrated: live placement/custody/physical access and Cognition interpretation contracts and validation evidence remain pending.
- 2026-11-03 (5606, KN-2): Implemented roster-based reporting coverage, simulation ticks, three-valued availability and unknown-safe stock diffs. KD-1 supplies complete-by-construction coverage; predicate expectations unchanged. Replaces the 5534 park. Implemented, not integrated: connection validation waits on Cognition holder/reporting ports and Society rosters; skill remains an opaque reported number.
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
- 2026-11-03 (5536, KN-4): The task requires `currentlyExecutable = holder present AND method conditions` (KN-1 feasibility/reach), a mechanical `invented` -> `currentlyExecutable` KD-1 mapping, and no KD-1 expected-value changes; it explicitly says to stop and park if an expected value would change. These requirements conflict in `test/kd1-static.test.ts`, KD-1e: B has two method holders and a recorded success, every B reach report is false, and the assertion requires `invented: true` alongside `possible: false`. The mechanical rename would require `currentlyExecutable: true`, but the requested predicate is `AND(true, false) = false`. Also, KD-1d in `test/kd1-dynamic.test.ts` expects false below minSkill even though `src/kd1.ts` reports a method holder after reading; removing the competence threshold from capability would make that holder executable under the fixture's satisfied conditions. Keeper ruling needed: authorize the affected KD-1 expectation changes or revise the execution contract/mapping. Implementation is stopped, not complete; KNT-8/KNT-16 remain open in this unit. Verification: focused static KD-1 tests 6/6 pass; full Vitest 300 passed, 1 skipped (18 files); `npx tsc --noEmit` passes; record checker reports 8 records, 0 failures. The task gate was run using PowerShell-equivalent commands and fails all five source checks because implementation was stopped: demonstratedHere/currentlyExecutable absent, invented/minSkill and medium.kind branch still present. Gate log removed.
- 2026-11-01 (2942): knowledge/technique.writing (data/techniques/writing.json) has isMedium true but no medium descriptor; kind and literacy-based user share remain unknown pending keeper metadata.
- 2026-11-01 (2941): KD-1g cost-advantage half skipped: no knob maps cost advantage to adoption speed (adopters only gates on > 0); contact half runs via adoption.q.
- 2026-11-01 (2907): KD-1e/f runner tests deferred per task's keeper-decision hold. No generation/copying window is assumed (DESIGN §1.2 leaves it open); agent/aggregate equivalence and remaining case acceptance tests await later tasks. The runner models first method acquisition with one B representative, fixed records/readers and source-only mortality; it does not model cohort growth or live ports.
- 2026-10-31 (2860): Task brief KD-1a asks for every capability state false in B on the stock fixture, but `fixtures/kd-1/world.json` reports B reach and feasibility true, so `capabilityState` correctly leaves `possible: true` (DESIGN §1.1). Test asserts empty B stock and false known/invented/adopted with `deployed: null`. Resolving the brief vs fixture needs a keeper change, not `src/`.
