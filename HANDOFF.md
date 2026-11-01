# Knowledge & Technology: package handoff

The keeper's handoff is `E:/AI Programs/HQ/handoffs/knowledge/HANDOFF.md`. This file is for belt units: each unit
adds one dated line under Done, and parks a disagreement with DESIGN.md under Blocked.

## Done

- 2026-11-01 (2942): Made isMedium authoritative for media availability; reject descriptors on false flags; missing descriptors preserve null kind/share; regression tests added.
- 2026-11-01: 2941 rewrote `test/kd1-dynamic.test.ts` (KD-1c main, KD-1g by q only, KD-1h at fixed holder share); parked halves skipped.
- 2026-11-01: 2907 added seeded aggregate KD-1 runner/runCase (`src/kd1.ts`); KD-1a/b/i tests pass.
- 2026-11-01: 2906 derived society media availability from deployment.
- 2026-11-01: 2905 added aggregate invention hazard and Bass adoption.
- 2026-11-01: 2904 added pure diffusion channel hazards.
- 2026-10-31: 2862 moved filesystem loader to scripts; fence test.
- 2026-10-31: 2860 KD-1 static tests (kd1-static); 2858 capability predicates and diffs.
- 2026-10-31: 2857 stock, loss/regain events, Henrich copying loss; 2856 schemas, loader, checker, fence.
- 2026-10-31: package scaffolded by the keeper.

## Resolved by the keeper (2026-11-01; DESIGN log)

- 2904 holder-zero: records and artefacts carry k with no living holder; only migration and talk scale with H_s/N_s (DESIGN §1.4). Fix in 2987.
- 2941 KD-1c and KD-1d: run with invention off (DESIGN §3); KD-1d is the explicit-skill-below-minSkill case. Tests in 2988.
- 2941 KD-1h before contact: needs a contact start time in the runner (2987); test in 2988.
- 2942 writing medium: no descriptor; user share = holders of the medium technique over population (DESIGN §1.8).
- 2860 KD-1a: B stays possible because the fixture gives B reach and feasibility; the test as written is correct.
- 2941 KD-1g advantage half and the dependence of q on tau: wait on research unit 2989 (forms with sources).

## Blocked

- 2026-11-01 (2942): knowledge/technique.writing (data/techniques/writing.json) has isMedium true but no medium descriptor; kind and literacy-based user share remain unknown pending keeper metadata.
- 2026-11-01 (2941): KD-1d skipped: the runner's invention hazard has no tau dependence (DESIGN §1.5); needs a tacitShare knob.
- 2026-11-01 (2941): KD-1g cost-advantage half skipped: no knob maps cost advantage to adoption speed (adopters only gates on > 0); contact half runs via adoption.q.
- 2026-11-01 (2941): KD-1h 'A loses k before contact reaches B' skipped: runner lacks a contact start time; loss-share half runs at a fixed 4 % holder share.
- 2026-11-01 (2941): KD-1c 'never invented when L_B = 0' skipped: conflicts with DESIGN §1.5 (trial needs only P and not-I); B invents with invention on.
- 2026-11-01 (2907): KD-1e/f runner tests deferred per task's keeper-decision hold. No generation/copying window is assumed (DESIGN §1.2 leaves it open); agent/aggregate equivalence and remaining case acceptance tests await later tasks. The runner models first method acquisition with one B representative, fixed records/readers and source-only mortality; it does not model cohort growth or live ports.

- 2026-11-01 (2904): holder-zero conflict. DESIGN §1.4 (lines 204-205) scales only the talk term by H_s/N_s; the artefact term `v·π_infer` and the record term `ρ·L_t·π_read` carry no H_s. `src/diffusion.ts` returns 0 for every channel when holders = 0 (lines 45, 55, 70), which zeroes the artefact (line 59) and record (line 72) terms too. Question for the keeper: should a surviving record or artefact still carry k after every holder is gone? This decides KD-1h.
- 2026-10-31 (2860): Task brief KD-1a asks for every capability state false in B on the stock fixture, but `fixtures/kd-1/world.json` reports B reach and feasibility true, so `capabilityState` correctly leaves `possible: true` (DESIGN §1.1). Test asserts empty B stock and false known/invented/adopted with `deployed: null`. Resolving the brief vs fixture needs a keeper change, not `src/`.
