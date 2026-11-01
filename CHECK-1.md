# CHECK-1: independent check of the knowledge engine against DESIGN §0, §1.1–§1.3

Checked by a unit that did not write the code (PLATFORM §11a). Read: DESIGN.md §0 and §1.1–§1.3, src/**, data/**, fixtures/**.

| # | Check | Verdict | Evidence | Note |
|---|---|---|---|---|
| 1 | No tech tree: no technique record and no code names another technique as a requirement | pass | data/techniques/lime-burning.json:5-8; data/techniques/writing.json:5-6; fixtures/kd-1/techniques/fixture-lime-burning.json:5-9; src/check.ts:34, 39 | Technique records name only `economy/recipe.*`, `fixture/recipe.*` and propositions. checkRecords rejects any `knowledge/technique.*` string or key in a technique record. |
| 2 | No dates: no `src/` file reads a year, period, Catalogue date or `history.*`; `catalogueRef` never dereferenced in `src/` | pass | src/check.ts:4, 37 (forbidden keys, a guard that rejects them); src/schema.ts:26, 55, 62-64 (type and format validation only); src/load.ts:9-13 (no date read) | Grep of `src/` for `catalogue`, `history`, `year`, `period`, `century`, `date` finds only the guard list and the `catalogueRef` format check. No `catalogueRef` value is read by any mechanism. |
| 3 | Stock not stored: `src/stock.ts` keeps no module-level state | pass | src/stock.ts:3-12 (types), 27-37 (pure helpers), 39-41 (`computeStock` builds `groups`/`societies` per call), 38 (comment) | No top-level `let` or mutable `const` in the file. `diffStock` recomputes both sides from inputs. |
| 4 | Five separate predicates: in `src/capability.ts` no state's value is computed from another state's value | pass | src/capability.ts:25-36 (`possible` from feasibility and reach only), 53-55 (`known` from stock entries only), 55 (`invented` from stock `bestSkill` and production `successes` only), 56 (`adopted` from `producersUsing` only), 57 (`deployed` from `share` only) | `invented` does not read `known`; `known` does not read `invented` or `adopted`. |
| 5 | No invented constants: every non-null Param in `data/` is researched or estimate with a source, or sits in `fixtures/` labelled fiction; `data/` values without a source are null and open | pass | data/techniques/lime-burning.json:10-14 and data/techniques/writing.json:7-11 (all null, `open`, `sources: []`); fixtures/kd-1/techniques/fixture-lime-burning.json:10-11 (`fiction`, non-null); fixtures/kd-1/techniques/fixture-lime-burning.json:13-14 (null, `open`) | Only non-null Params are the fixture's `fiction` values. Records in `data/propositions/` have no Params. Non-Param numbers in `fixtures/kd-1/world.json` (population, skill, fidelity, share) are fixture inputs, under the record label `fiction` at world.json:2. |
| 6 | Imports: `src/` imports only `@rex/kernel` and its own files | **fail** | src/load.ts:1 `import { directories, join, jsonFiles, readFileSync } from '../scripts/files.ts'` | The import reaches outside `src/` to `scripts/files.ts`, which is neither `@rex/kernel` nor a file of `src/`. All other imports are `@rex/kernel` (src/index.ts:2) or in-`src/` files. |

## Failing checks

- **Check 6 (imports):** src/load.ts:1 imports from `../scripts/files.ts`. The fix belongs in a later unit: move `directories`, `join`, `jsonFiles` and `readFileSync` into `src/` or `@rex/kernel`, or inline them. This check did not edit any file.

Result: fail
