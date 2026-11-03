# Rules for Cursor Composer (and any belt worker) in `Toolchain/knowledge`

1. Read `PLAN.md` (its §8.2 card for your lane) and the `DESIGN.md` sections your task names. PLAN.md wins where they
   differ.
2. **Never a tech tree (Rex).** No technique record or code names another technique as a prerequisite. A technique
   requires propositions, a skill and its recipes' physical inputs only (DESIGN §0 invariant 1, §1.3).
3. **Never read a date (Rex, PLATFORM §6).** No code takes a calendar year, period, Catalogue date or `history.*`
   value as input. `catalogueRef` is an opaque reference string, never dereferenced by a mechanism.
4. **The five states are separate predicates** (possible, known, invented, adopted, deployed; DESIGN §1.1). Never
   derive one as a copy of another; every state can fall. PLAN §2 and §3.1 replace `known` and `invented` with
   availability, demonstrated here and currently executable.
5. **The stock is an aggregate, never a second truth** (DESIGN §0 invariant 3, §1.2): computed from holders and
   readable records supplied through ports, nothing stored that a port did not report. No mind reads it.
6. `src/` imports only `@rex/kernel` and its own files. Every other engine (Cognition, Society, Economy, Reality,
   Life) is a port: a TypeScript interface plus a declared stub in `test/` or `fixtures/`, named as a stub.
7. Deterministic: random draws only from `@rex/kernel` streams (`streams(seed)`, one stream per mechanism id); no
   `Math.random`, no `Date.now`; outputs sorted by id.
8. Never invent a constant. A parameter without a researched source is `null` and the code refuses to run the
   mechanism that needs it (throws, naming the parameter). Fixture numbers are labelled `fiction` in the fixture.
9. Style: TypeScript, ES modules with `.ts` import suffixes, small files, one test file per source file in `test/`,
   test titles naming the rule or DESIGN section they check.
10. Run only your own tests while working (`npx vitest run test/<file>.test.ts`); the runner runs the Gate.
11. Never edit another repo. One commit, not pushed, ending with `Co-Authored-By: Cursor Composer <composer@cursor.com>`.
    Nothing left uncommitted. Close with a short report: done or parked, tests, commit hash.
