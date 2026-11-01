# @rex/knowledge

Engine 10, Knowledge & Technology (P9): discovery, invention, capability and diffusion as mechanisms. Five distinct
states per (society, technique): possible, known, invented, adopted, deployed. The collective knowledge stock is an
aggregate over living holders and surviving readable records, **with loss**. **Never a tech tree; never reads a date
(Rex).** Design: `DESIGN.md` (approved by Rex 2026-10-31). Rules for belt workers: `codex/RULES.md`, `cursor/RULES.md`.

## Layout

- `data/techniques/<slug>.json`, `data/propositions/<slug>.json`: one record per file (DESIGN §1.3)
- `fixtures/kd-1/`: the two-settlement demonstration world (DESIGN §3), fiction-labelled numbers
- `src/`, `test/`: the engine; every other engine is reached through ports with declared stubs

## Test

```
npm install
npm test            # vitest run
npm run typecheck   # tsc --noEmit
```
