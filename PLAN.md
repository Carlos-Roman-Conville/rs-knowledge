# Knowledge & Technology: PLAN (draft, keeper, 2026-11-02)

Per `HQ/handoffs/PLAN-SPEC.md`. Consolidates `Toolchain/knowledge/DESIGN.md` (approved 2026-10-31, "DESIGN") and
`research/ADOPTION-INVENTION.md` (unit 2989, "RESEARCH"). Package HEAD 9570bc9; 231 pass, 4 skip, tsc clean (0426daa run).

## Pass 1 (one page)

**Present (implemented, unit-tested, all inputs stubbed):** five capability predicates `src/capability.ts:39-59`;
stock recomputed from holder and record reports, loss events with causes `src/stock.ts:39-117`; three channel hazards
`src/diffusion.ts:41-81`; invention hazard `E·q`, `q` a scalar `src/invention.ts:5-17`; Bass step with clamp and
abandonment `src/adoption.ts:40-46`, eligible producers all-or-nothing on `Δc > 0` `src/adoption.ts:30-34`; Henrich
`Δz̄` and `N*` `src/copying.ts:11-20` (not called by the stock or KD-1, `src/kd1.ts:86`); media from deployment
`src/media.ts:15-34`; technique schema `src/schema.ts:16-30`; KD-1 runner `src/kd1.ts` (fiction fixture).

**Missing:** (1) the coupling from a technique to the **physical capability** it changes in another engine (no field,
no port; §3.9 below); (2) an aggregate generation step that applies Henrich to the stock; (3) the KD-1g cost-advantage
form (`test/kd1-dynamic.test.ts:204` skipped); (4) any form for `q(s, τ)`; (5) literacy as holders of the reading
technique (today a host report, `src/ports.ts:34`); (6) experimentation hours `E` from Economy/Cognition; (7) the Economy
gate KNT-E1; (8) every port in `kernel.json` (`"ports": []`).

**Owned quantities:** capability state per (society, technique) (4 booleans + deployment share in [0,1]); stock entry
per (society, item) (holder count, heard-of count, best skill [0,1], readable/unreadable record counts); technique
records (data); channel hazards [1/yr]; invention hazard [1/yr]; aggregate adopter count A ≤ M; mean best skill z̄ per
generation. All are counts or invariants, none a conserved physical quantity: K&T moves no mass, energy or money.

**External inputs:** holders and skill (Cognition, KNT-C1 agreed; skill practice **KNT-7**: Cognition's chain is in its PLAN A.3, port A.4; units fixed, form and rates open for Rex);
deaths/departures (Life, Society); contact rates per channel and literacy institutions (**KNT-S1 with Society, not
yet raised**); record objects (Economy) and their decay (Reality); feasibility (Reality) and reach (Economy/Reality);
cost advantage and production by recipe (Economy).

**Outputs:** `society.capability_state`, `society.knowledge_stock`, `society.available_media`, the method gate read by
Economy (KNT-E1). K&T never writes a physical effect: a technique changes the world only by making a recipe/process
runnable, whose physics (Reality) and labour (Settlement/Economy) are computed once by their owners.

**Contribution to M1a: none, and K&T is not on M1a's path.** Eating adjacent food (prepared bread with supplied starting
knowledge) needs no live Knowledge engine. K&T is a parallel track (lanes KN-1–KN-9, §8), first used at **M2** (a method
changes the work a task costs, through Reality's mechanics and Settlement's labour), then M3, M5.

**Flagged assumptions / defects:** aggregate invention **off for M1a–M2 (Rex, KNT-Q5)**: no technique arises except
by diffusion or reading; individual invention planned as a Cognition → body → Reality → Cognition → K&T → Society
chain (§3.7a); every constant null (KNT-4); Bass p, q only for modern
products (plausibility bracket, never parameters); Henrich α, β illustrative only (RESEARCH); **confirmed defect
KNT-8**: `media.ts:27-30` derives user share from a `medium.kind` descriptor the 2026-11-01 ruling removed, so
`data/techniques/writing.json` (no descriptor) yields `userShare: null` (by code read, not run); **doc defect KNT-9**:
DESIGN §1.2 misattributes "environment and risk" to Read 2006; §4 hold-out should be Collard 2005, not Vaesen 2016.
`productivity(holder, role)` in `settlement/src/providers.ts:19` and `economy/src/providers.ts:53` is a host
skill-band table today. **DC-14 (controller ruling, 2026-11-02; Rex may override):** productivity is derived in
Settlement's `labour_cap`, whose inputs include the method this engine gates (KNT-E1) and Cognition skill (KNT-7). So the
gate is a port Settlement reads; K&T computes no productivity.

**Review 2026-11-02 (lanes, §8), defects labelled against their contracts:** KNT-14 against KN-3 access ownership
(record access inferred from society membership, `stock.ts:30-32,73`); KNT-15 against KN-1, where recipes are
alternatives (`capability.ts:29-35` requires every recipe); KNT-16 against KNT-Q6 independent states (`capability.ts:55`);
KNT-17 against KN-7 adoption ≠ abandonment (`adoption.ts:22-27,45`); counts need coverage; unknowns name their missing input and producer.

**Next dependency-ready task (when Rex lifts the STOP):** CP-1, starting with cards KN-1, KN-2, KN-4 and the KN-5
contract (§8.2). It needs no live engine. The KD-1g cost-advantage form moves to CP-4.

---

## Pass 2: the full plan

References: DESIGN §n = `Toolchain/knowledge/DESIGN.md`; RESEARCH = `Toolchain/knowledge/research/ADOPTION-INVENTION.md`;
CHECK-1/2 = `Toolchain/knowledge/CHECK-1.md`, `CHECK-2.md`. Everything in DESIGN §0–§6 is carried forward unless this
plan says **superseded** or **gap**. Evidence levels are PLATFORM §4 (1 law … 6 fiction); value labels are §5 below.

### 1. Purpose and boundaries

**Determines:** for every (society, technique), which of the five capability states hold and why (Rex, PLATFORM §6:
possibility, knowledge, invention, adoption and deployment are distinct); the collective stock with loss; what a
technique requires *in knowledge* (propositions, minimum skill, tacit share); which channel carries a technique between
communities and at what hazard; aggregate-resolution invention, copying loss and adoption; which media a society has.

**Receives:** holders and skill (Cognition), deaths and departures (Life, Society), contact rates and literacy teaching
(Society), record objects (Economy) and their decay (Reality), feasibility (Reality), reach, cost advantage and
production by recipe (Economy). Catalogue dates only through a game adapter that seeds initial stocks, never a mechanism.

**Never calculates** (DESIGN §0 table, carried forward): beliefs, skill, a decision to try or adopt (Cognition); the
network and distance decay (Society, Reality routes); message comprehension (Cognition); physical feasibility, medium
properties, any force, energy, yield or decay (Reality); materials, tools, labour hours, output, prices, record objects
as goods (Economy, Settlement); births and deaths (Life); institutions, schools, censorship (Society, Government);
reference dates (Catalogue); the record (History).

**How K&T reaches the causal loop.** world → body → mind → action → world: K&T sits between *mind* and *action*. A mind
can act by a method only if it holds the technique (Cognition's holder) and the method's recipe is runnable here (K&T's
gate on Economy's recipe). The method's physical consequence (force needed, energy spent, material transformed, time
taken) is then computed once by Reality, Life and Settlement. K&T changes *which* actions exist, never their physics.

**Invariants** (DESIGN §0, all carried): no tech tree; no date reads; the stock is an aggregate, never a second truth;
minds never read the stock; loss is real; states are not copies of one another. **Added:** (7) K&T writes no physical
quantity and no labour quantity; a technique's effect on the world exists only inside the owning engine's recipe or
process (one transfer per flow, PLATFORM §7a).

### 2. State

| Quantity | Unit / type | Range | Meaning | Kind |
|---|---|---|---|---|
| `possible P_s(k)` | boolean or null | {T, F, null} | recipe processes feasible and inputs reachable; null = an input unreported | derived predicate, recomputed |
| `known K_s(k)` | boolean | | a holder of the principle or a readable record exists | derived predicate |
| `invented I_s(k)` | boolean | | a holder with skill ≥ minSkill and ≥ 1 recorded success here | derived predicate |
| `adopted A_s(k)` | boolean | | ≥ 1 producer uses it for production | derived predicate |
| `deployed D_s(k)` | fraction or null | [0, 1] | output of k's recipes / output of the good (Economy's numbers) | derived ratio |
| `H_s(j)` holders | count (persons) | 0 … N_s | members who *hold* item j (Cognition, θ_hold) | count; invariant: a mind is in one society |
| heard-of | count | 0 … N_s − H | entry exists, below θ_hold | count |
| `z_s(k)` best skill | dimensionless | [0, 1]: fraction of the technique's expert performance (`mind.skill`, Cognition PLAN A.3/A.4) | best skill among holders; `minSkill` on the same scale | max over holders |
| `R_s(j)` readable / unreadable records | count | ≥ 0 | intact records with / without a living reader of the script | count; each record in one place |
| technique record | data | | `enables`, `propositions`, `minSkill`, `tacitShare τ`, `copyingLoss α, β`, `isMedium`, `catalogueRef`, sources (`src/schema.ts:16-30`) | data, versioned |
| `h_mig, h_trade, h_rec` | 1/yr | ≥ 0 | per-channel hazard that t gains a holder (aggregate) | rate |
| `λ_inv` | 1/yr | ≥ 0 | invention hazard (aggregate) | rate |
| `A` adopters, `M` eligible | count (producers) | 0 ≤ A ≤ M ≤ producers | aggregate Bass state | stored per step |
| `z̄_s(k)` cohort skill | latent skill units (§3.3) | ℝ, mapped to [0,1] | aggregate best-model skill per generation | stored per generation |
| `society.available_media` | list | | media techniques deployed, user share in [0,1] | derived |

No K&T quantity is conserved mass, energy or money. Its conservation checks are count invariants: no mind in two
societies (`src/stock.ts:58-60`), no record in two places, A ≤ M. A and z̄ are the only stored dynamic state.

**Added state (review 2026-11-02, lanes KN-2, KN-4):**

| Quantity | Unit / type | Range | Meaning | Kind |
|---|---|---|---|---|
| reporting coverage `C_s` | fraction | [0, 1] | distinct people on Society's applicable roster whose report is in this snapshot / people on that roster (corrected 2026-11-03) | carried with every count; **a count is never reported without its coverage and snapshot time**. The denominator is Society's roster (with its tick), independent of the reports; no roster ⇒ coverage unknown; an empty roster ⇒ not applicable, never a division by zero |
| availability `K^avail_s(k)` | three-valued | {T, F, unknown} | T if ≥ 1 confirmed holder or qualifying record; F only if coverage is complete, no holder and no qualifying record; else unknown | derived. Replaces the boolean `known` |
| demonstrated here | event flag + time | | a qualifying success event of k has occurred in s (Reality outcome via Economy) | retained fact; never cleared by holder loss |
| currently executable | three-valued | | a holder with access to the method and the required conditions is present now | derived; Rex's "invented" (KNT-Q1: a working method present here); **independent of demonstrated here** (KNT-Q6) |
| freshness | timestamp per input | | when each input of an assessment was last reported | status, **never a truth value** |

Every `unknown` names its missing input and that input's producer, e.g. "feasibility of recipe r: Reality, not
reported". A stale assessment is shown as its last value plus its age ("previously true, evidence stale since t").
A timeout never supplies the missing evidence.

### 3. Mechanisms (each as a calculation chain)

**3.1 Capability state** (`knowledge.capability.state`, DESIGN §1.1, `src/capability.ts`). Chain: Reality feasibility +
Economy/Reality reach per enabled recipe → `possible` (any false ⇒ false; any null ⇒ null, `capability.ts:25-36`);
stock entry → `known`; best skill vs minSkill and Economy successes → `invented`; Economy producers using → `adopted`;
Economy output share → `deployed`. Output changes: Economy's gate (3.4), Bass eligibility (3.6), invention (3.7), media
(3.8). Recomputed whenever an input emits; changes diffed into events (`capability.ts:70-86`). Code adds a second route
to `known` (every proposition of k known, `capability.ts:53-54`), consistent with DESIGN §1.1 "holds the principle";
carried. Stops applying: a technique with no recipe link reports `possible = null`, never true.

**Corrections (review 2026-11-02; lanes KN-1, KN-4):**
- **`enables` must say what its recipes are (KN-1; KNT-15: a defect where the listed recipes are alternatives, correct where all are mandatory; the contract is KN-1's definition).** `capability.ts:29-35` ANDs every listed
  recipe, so one infeasible recipe makes the whole technique impossible. That is right only if every recipe is
  mandatory. When the recipes are alternative ways to carry out the method:
  `P_{s,k} = ⋁_{r ∈ A_k} P_{s,r}`, and within a recipe `P_{s,r} = ⋀_{j ∈ req(r)} P_{s,r,j}`, in Kleene three-valued
  logic. One known-feasible alternative ⇒ possible; all alternatives known impossible ⇒ impossible; otherwise unknown.
  KN-1 defines `enables` (alternatives vs prerequisites, versioned links) **before** the equation changes. Test: one
  working alternative beside one unavailable alternative.
- **`invented` is split (KN-4, confirmed defect KNT-16).** Today `invented` needs a current skilled holder *and* a
  recorded success (`capability.ts:55`), so losing the last practitioner also erases the past demonstration. Two
  states replace it: *demonstrated here* (a retained success event) and *currently executable* (holder, access and
  conditions present now). Rex's KNT-Q1 meaning, "a working method present here", is *currently executable*.
  *Demonstrated here* is a retained event fact, not a sixth state: History keeps where a technique was first developed,
  K&T keeps whether it has ever worked here. **Accepted (2026-11-02, KNT-Q6): the two are independent.** Neither is
  derived from the other. A demonstration can stand with no current holder; a newly arrived holder can make k currently
  executable before any success here.
- **Deployment needs a declared basis.** `D_{s,k,g} = Q_{s,k,g} / Q_{s,g}` for one declared product g, one output basis,
  one unit and one reporting interval. If `Q_{s,g} = 0` the result is *undefined / not applicable*, never 0. A product
  with several comparable output bases (mass, count, energy content) reports one ratio per declared basis. The schema
  rejects a ratio whose numerator and denominator differ in product, basis, unit or interval, so unrelated products
  can never be summed into one fraction.
- **Share convention (2026-11-03): output produced using the method.** `Q_{s,k,g}` counts each unit of g once if k
  was used in producing it. One loaf can involve milling, fermentation and baking, so each method's share can cover
  that loaf and the shares of different methods need not sum to 1. Partitioned shares (summing to 1) are reported only
  for a declared comparison group of mutually exclusive alternatives (two milling processes); the group is named in the
  report.
- **Used ≠ deployed:** *used* = producers using it now (Economy). *Deployed* = the share above. Adoption never
  guarantees output. *Has adopted* (a retained adoption event, KN-7), *currently executable* and *used now* stay three
  distinct facts: a furnace business lacking fuel this month still adopted the furnace.

**3.2 Collective stock with loss** (`knowledge.collective.stock`, DUP-61, DESIGN §1.2, `src/stock.ts`). Chain: Cognition
holder reports (heard-of / holds, skill) + Economy record objects with Reality's intact flag + reader reports →
per (society, item) counts and `known` → capability state. Loss routes: Life death, Society departure, Cognition
forgetting, Reality record decay, no reader; each recorded as a cause on `lost`, `holders_gone_record_survives`,
`unreadable`, `regained` (`stock.ts:85-117`). Pure recompute, no retained state (CHECK-1 #3). **Reader fidelity**
(DESIGN §1.3): a reader becomes a holder of the method at skill ≤ fidelity × writer's skill, fidelity ≤ 1 − τ; today
only in the KD-1 runner (`src/kd1.ts:165`). Integrated, the skill a reader reaches is Cognition's learning from reading:
K&T supplies τ and the record's fidelity and reads the resulting holder. **Gap:** literacy is a host report
(`ports.ts:34`); by DESIGN §1.8 it must be the holders of the reading technique (3.8).

**Exact counting rules (review 2026-11-02; lanes KN-2, KN-3, KN-8).** For society s, technique k and declared
population `P_s` (Society):
`H_{s,k} = Σ_{i∈P_s} 1[i holds k]`; `H^heard_{s,k} = Σ_{i∈P_s} 1[i heard of k ∧ ¬ holds k]`. Both count distinct people
from Cognition's reports. They are carried with coverage `C_s` and the snapshot time. K&T never infers skill or holding
from membership.
`R_{s,k} = Σ_{r∈R_k} 1[r survives ∧ an eligible reader can access and interpret r]`.
- **Missing input is evidence of neither loss nor presence.** A half-reported society shows "3 confirmed holders, 60 %
  coverage". It does not show a total of 3, and the confirmed observations are kept. Below a declared coverage a
  snapshot is *partial*, and its zeros are not absences. Availability follows the §2 rule.
- **Access has an owner (confirmed defect KNT-14).** `stock.ts:30-32,73` counts a record as readable when anyone in its
  society can read its script, which omits whether that reader can reach *that* record. Allowed only as a labelled
  fixture assumption. Integrated, K&T consumes an access assessment per (reader, record) from the agreed placement,
  custody and physical-access contracts (Reality: placement and physical access; Economy: custody). It never computes a
  second access calculation. Script competence is Cognition's `mind.skill` for the reading technique.
- **A surviving record preserves information, not skill.** Reading makes a holder only through Cognition's learning
  (§3.5). The record alone changes `R` and availability, never `H` or skill. Reading can contribute to learning and
  skill through Cognition; what it never does is count as a successful physical demonstration. The KD-1 runner's
  shortcut (reading sets skill and can increment successes without executing the method, `kd1.ts:165`) is a labelled
  fixture of the KD-1 acceptance runs only and never becomes the live learning or invention pathway.
- **Retention at individual resolution (KN-8):** loss is derived only from actual holder changes (death, departure,
  forgetting, as reported by Life, Society and Cognition) and from record condition. K&T adds **no forgetting rate of
  its own** on top of Cognition's.
- **Required tests:** a duplicate holder report or record report counts once; an inaccessible record does not count;
  a missing snapshot gives *unknown*, not *lost*; a departure without death moves the holder (Society's event) and
  changes no skill; last holder leaves, readable record survives, later someone learns from it: each state changes for
  its own reason.

**3.3 Copying loss per generation** (aggregate only; part of `knowledge.collective.stock`; DESIGN §1.2; RESEARCH
"Copying loss"). Chain: holders here + contact-weighted holders elsewhere (Society) → `N_eff = H_s + Σ_t w_st·H_t` →
`Δz̄ = −α_k + β_k·(γ + ln N_eff)` (`src/copying.ts:11-16`) → `z̄_{g+1} = z̄_g + Δz̄` → if mapped z̄ < minSkill, `invented`
falls (records may keep `known`). Critical size `N* = exp(α/β − γ)` (`copying.ts:18-20`); RESEARCH confirms it matches
the Acerbi replication (α = 7, σ = 1: analytic 616 vs simulated 639; α = 9: 4550 vs 4806). Assumptions: a learner copies
the best model it can see; Gumbel error; N constant over a generation. **Risk KNT-10 (invalid coupling):** Henrich's z
is an unbounded additive scale, Cognition's skill is [0,1]. The step runs on a latent scale mapped to [0,1] only by
Cognition's skill definition. Cognition PLAN A.3 now fixes the bounded scale (`mind.skill` = fraction of expert
performance, from practice outcomes, decaying without practice). The practice curve is still open between a power law
and an exponential (Newell & Rosenbloom 1981; Heathcote et al. 2000), and the per-technique performance measure is
open too. So the latent-to-bounded map stays undefined, and the step is **not wired until Rex settles KNT-7**.
Generation length is KNT-5 (open). Switchable, because the population–complexity link is contested: for, Kline & Boyd
2010 (n = 10) and Collard et al. 2013 (40 food-producing groups, r² 0.27 / 0.39); against or conditional, Collard et al.
2005 (20 hunter-gatherer groups, null), Read 2006 (adequate technology, changed resource procurement), Vaesen et al. 2016
(review, six of eight studies null). Both settings run in validation (§7). At agent resolution there is no equation:
the effect emerges from Cognition's skill practice over Society's network; invariant 3 requires the means to agree.

**Experimental status (review 2026-11-02, KN-8).** This is one particular social-learning model, not a universal rule
that small populations lose technology. It stays disconnected, not patched with an arbitrary conversion, until five
things are defined:
1. the scale of z and its link to Cognition's measured performance (KNT-10, KNT-7);
2. the length of a generation (KNT-5). This is load-bearing, because α and β are per generation, in skill units, not
   rates;
3. effective access to distinct teachers (`N_eff` counts teachers a learner can actually reach, from Society);
4. the no-teacher case (`N_eff = 0`, where `ln` is undefined; the code throws below 1, `copying.ts:14`);
5. parameters, and validation data independent of them.

**3.4 Technique knowledge requirements and the method gate** (`knowledge.technique.requirements`, DESIGN §1.3).
Technique records are data (`data/techniques/*.json`, checked by `src/check.ts`, `src/schema.ts:42-99`). The gate
(KNT-E1, Economy): a recipe of k runs at producer p only if an assigned worker holds k with skill ≥ minSkill (agent
resolution), or `I_s(k)` holds and the labour draws on the holder cohort (aggregate). Below minSkill the yield and
failure effect is Economy's/Reality's: skill changes execution, never physics (precedent `realism/src/process.ts:17-23`,
operator skill sets control noise only). Replaces `Recipe.knowledge` (`economy/src/state.ts:35`; KNT-1). **Consumers
(DC-14):** Economy's recipe run and Settlement's `labour_cap`, which derives productivity from the gated method and
Cognition skill. **IT-INV-1 (registry):** the gate never makes a recipe runnable without Reality's feasibility
(`possible` must be true, not null).

**Method access, not a success gate (review 2026-11-02, KN-5).** For a deliberate known-method candidate:
`HasMethod(i, k) = Holds(i, k) ∧ RequirementsMet(i, k)`. RequirementsMet uses the access, materials and conditions
reported by their owners. This decides only whether a recognised method is *available* to Cognition's candidate
generation and the execution contract. It never decides success: every attempt is still resolved physically (Reality,
Life). One expert in a village never makes every resident an expert. **minSkill reconciled:** `minSkill` is the
competence threshold of a *production abstraction*: the level at which Economy's recipe rates describe the work. It is
not a prerequisite for executing an operation. K&T never forbids a low-skill attempt. An attempt below minSkill is
outside M2 (no supported model of its likely failure). It will get its own experimentation path later, shared with
the §3.7a invention chain, never a rule here. This supersedes the earlier wording above, "runs only if … skill ≥
minSkill": for the abstraction, a holder below minSkill does not count as competent labour for that recipe; the person
is not barred from trying.

**3.5 Diffusion between communities** (`knowledge.technology.diffusion`, DUP-60, DESIGN §1.4, `src/diffusion.ts`).
Chain: Society contact rates per channel (migrants m, contacts c, artefacts v, records ρ, per year) + holder share
H_s/N_s + receiver literacy L_t → `h_mig = m·(H/N)·π_practise`, `h_trade = c·(H/N)·π_tell + v·π_infer`,
`h_rec = ρ·L_t·π_read` → exponential arrival → a new holder in t (aggregate) → stock. Artefact and record terms do not
scale with H_s (ruling 2026-11-01). No second distance gear (CHECK-2 #5). At agent resolution a specific migrant arrives
(Society), practises or not (Cognition), neighbours learn (Cognition). Contact rates come from KNT-S1.

**Events first, aggregate later (review 2026-11-02, KN-6).** At individual resolution the chain is contact (Society) →
observation, message or reading (Cognition communication) → Cognition's learning → a changed holder report. K&T counts
the result and never writes another person's memory. The aggregate hazards are **candidate approximations**: `m, c, v,
ρ` are carrier events per unit time, the π terms conditional probabilities, `L_t` the eligible-reader share.
- **Migration is directional:** `h_{s→t} = m_{s→t} · (H_{s,k}/N_s) · π_practise`, a transmission opportunity from s to t.
  Society owns the movement itself: a source → destination event that changes both memberships. K&T updates both
  holder counts from that event. The hazard never creates a person or moves one. Until Society supplies the event,
  migration is a labelled fixture.
- **The artefact channel is intended:** `v·π_infer` has no holder share because an artefact can teach with no holder
  alive. Traces and tests keep direct-contact and artefact-inference channels apart. Holder-extinction tests switch
  the artefact channel off; zero artefacts give zero artefact hazard.
- **Arrival probability:** for a constant combined hazard h, `P(≥ 1 successful arrival in Δt) = 1 − e^{−hΔt}`
  (already `kd1.ts:73-76`); for a varying hazard use `1 − exp(−∫h dt)`. This is the probability that at least one
  holder arrives in t, **not** the fraction of t's population that learns. A further learner in t is a separate event.
- **Overlap (corrected 2026-11-03).** Summing hazards of distinct event processes is correct: `h = Σ_c h_c`. Double
  counting arises only when two channels describe the same underlying opportunity, and sampling a channel in
  proportion to `h_c` does not repair an inflated total; it only labels the event. The rule: define non-overlapping
  transmission opportunities (one migrant, one contact, one artefact, one record reading) **before** the channel rates
  are set; at individual resolution each explicit event carries an opportunity id and is processed once. One encounter
  may carry several kinds of information; that is not forbidden to make labels exclusive.
- **Quantity kinds (2026-11-03).** Every value at a seam declares whether it is an event probability, a realized
  count, an expected count or a population fraction. A society-level `P(≥ 1 arrival)` is never multiplied by a
  population to give learners; aggregate fractional adopters are expected counts, never partial people.
- **Tests:** zero contacts; distinct channels sum, one opportunity is processed once (by its id);
  time-step consistency (the same probability over one Δt as over two Δt/2); contact or receipt of a record without
  learning.

**3.6 Adoption and deployment, with the cost-advantage form** (`knowledge.adoption.aggregate`, DESIGN §1.6, RESEARCH (a);
resolves KD-1g). **Supersedes** DESIGN §1.6's all-or-nothing `M_s` (`src/adoption.ts:30-34`). Chain: Economy's
per-producer cost advantage Δc_i (cost of the current method − cost of k's recipe per unit output, smoothed over
Economy's window) + capability state + a holder in reach → ceiling and speed → Bass → adopters → Economy production by
recipe → `deployed`.

```
M_s   = #{ producers i : Δc_i > 0 ∧ P_s(k) ∧ I_s(k) ∧ a holder in reach of i }    ceiling (Griliches: ceilings follow profit)
r_s   = mean over i in M_s of Δc_i / c_old,i                                        relative advantage, dimensionless, ≥ 0
q_eff = q_c · (1 + κ · r_s)                                                         speed (Griliches: slopes follow profit)
dA/dt = (p + q_eff · A / M_s) · (M_s − A)                                           Bass 1969; A clamped to M_s (abandonment)
```

- Heterogeneous thresholds (Van den Bulte & Stremersch 2004, level 2) make the ceiling rise with the advantage with no
  added constant: more producers cross Δc > 0. Economy must report Δc *per producer*, not one number.
- `κ ≥ 0` is the only new constant: **open**, level 5. κ = 0 means profit sets the ceiling only. Sources support the
  sign (Griliches 1957 abstract; Mansfield as quoted in Stokey 2021, secondary), not the shape. κ is calibrated later
  against Griliches' state slopes once the regression tables are read, with states held out. KD-1g uses a **fiction**
  κ from `fixtures/` and a direction-only gate.
- `p` is external influence (arrivals over §3.5 channels); `q_c` is within-society contact density (Society, KNT-S1);
  both fixtures until then. Published p ≈ 0.01–0.03, q ≈ 0.2–0.5 per year are modern marketed products (RESEARCH,
  secondary): a plausibility bracket for tests, never a parameter.
- **Cost in physical terms (KNT-E2, Economy):** where no market prices exist, Δc is the difference in person-hours and
  input amounts per unit output (`labourHoursPerUnit`, `economy/src/state.ts:21`), which Reality and Life make physical
  at M2. K&T never computes a cost; it reads Economy's comparison.
- Deployment stays Economy's production by recipe; K&T reads it.

**Restrictions (review 2026-11-02, KN-7).** Bass 1969 modelled first purchases of consumer durables. Here it is a
**restricted candidate** for aggregate resolution only, needing its own validation for historical techniques. At
individual resolution adoption is derived: each producer's use is Cognition's choice, counted by K&T.
- **Test the basic model first:** constant M against the closed-form Bass solution (§7) before any extension.
  `q_eff = q_c(1 + κr)` stays a hypothesis, not a law, deferred, and is not built before CP-4.
- **Exact update for fixed conditions (2026-11-03; scheduled with CP-4 aggregate adoption, not a CP-1 requirement; 5538's closed-form check of the current update stays).** With `a = A/M`, `E = e^{−(p+q)Δt}`:
  `a' = [p(1 − E) + a(q + pE)] / [p + qE + qa(1 − E)]`, `A' = M·a'`, valid for M > 0, 0 ≤ a ≤ 1, p, q ≥ 0, while M, p
  and q stay fixed over Δt (the keeper checked it against the logistic substitution; Δt → 0 gives a, Δt → ∞ gives 1,
  p = 0 with a = 0 stays 0; at p = 0 it reduces to the logistic `a / (a + (1 − a)E)`). Explicit cases, where the
  formula is 0/0 or undefined: p = q = 0 ⇒ a' = a; M = 0 ⇒ not applicable. A step is split wherever M, p or q change; an adopter count is never reinterpreted against
  a new M without reconciling membership. This is a numerical simplification, not evidence that Bass fits a society.
- **Who may adopt (2026-11-03).** Every adopting producer must have the knowledge, personnel, access and resources the
  method needs under the declared production model; a business may adopt by hiring a holder, so `A ≤ H` is **not**
  imposed (producers and people are different populations). Individually represented producers are checked
  individually (KN-5 per producer); for aggregate adoption M is derived from those requirements, never from the raw
  holder count. Where the requirements are unknown, M is unknown.
- **Three causes of A falling, never a clamp (confirmed defect KNT-17).** `adoption.ts` clamps current adopters to a
  smaller ceiling, which silently models instant abandonment. Each fall has its own recorded transition: (1) the
  adopting entity departs or dies (Society, Life); (2) it loses the conditions required for current use (KN-5
  re-evaluated: it stays *has adopted* but is not *used now*); (3) it decides to stop (Cognition, or a declared
  aggregate abandonment rate at CP-4). A skilled worker's death does not remove the business: its capability is
  recomputed, and another worker may replace them. Until these transitions exist, an A above the new M is an error
  reported to the caller, never clipped.
- **Costs must be comparable (supersedes the person-hours bullet above).** Person-hours, fuel mass and material
  quantities are never subtracted into one scalar without a declared valuation rule. Economy supplies Δc only as a
  comparison under a named valuation (market prices where a market exists; otherwise Economy's declared rule, KNT-E2).
  Without one, Δc is unknown and M is unknown.
- **What causes the first adoption, counted once (corrected 2026-11-02).** p is **not** set to 0 whenever diffusion
  runs: with p = 0 and A = 0, Bass cannot start. The roles are kept apart instead. KN-6 arrivals change *who can*
  adopt: a producer enters M only once a holder is in reach. Bass's p is the rate at which producers *already in M*
  adopt without imitation (innovators); it never stands for the arrival of knowledge. So the first adoption in s is a
  p-term event among eligible producers (aggregate), or one producer's choice (individual resolution, Cognition). Every
  adoption, the first included, is one event in KN-7's single adoption record and increments A once. An arrival
  (KN-6) never increments A, and an adoption never creates a holder. Where §3.5 is not simulated, its effect on M is a
  declared fixture.

**3.7 Invention** (`knowledge.invention.hazard`, DESIGN §1.5, RESEARCH (b)). **(Rex, 2026-11-02, KNT-Q5)**
aggregate invention is **off for M1a–M2**. That switches off the aggregate shortcut; it does not make invention
impossible. Diffusion (3.5) and adoption (3.6) keep running.

**Recorded limitation (M1a–M2).** The aggregate hazard is off, and the individual chain below needs Cognition's
`decision.generate`, which is not designed yet (KNT-6). So in M1a–M2 no technique appears in a society except by
diffusion from a seeded or neighbouring stock, or by reading a record. No M1a–M2 result may claim anything about
invention timing or rate. The switch `inventionOff` already exists (`src/invention.ts:11`).

**3.7a Individual invention: a cross-engine chain (the plan of record).** Each step has one owner. K&T owns only
step 5. The registry maps it as chain INV-01..07 (`HQ/handoffs/registry/INTEGRATION-PLAN.md` §7b). K&T's part
there is KNT-C1 holder port → stock → capability state, under integration test IT-INV-1.

| Step | Owner | What happens | What it hands on |
|---|---|---|---|
| 1 propose | Cognition (`decision.generate`, KNT-6) | a mind forms a new approach: an intention combining actions it can do, materials it can reach and propositions it holds | an intention with its action and target |
| 2 attempt | the person (Life: body, effort) via the intention-resolution chain (CHAINS) | the body carries the attempt out, spending time and energy | the executed action |
| 3 physical result | Reality (and Life where the body is the object) | physics decides what happened: the material transformed or not, the yield, the cost. An infeasible approach fails here | an outcome on the kernel trace |
| 4 learn | Cognition (outcome learning, attribution, skill practice KNT-7) | the mind forms or changes a belief and a method skill from the outcome | a holder report: holds method m, skill z |
| 5 track | **K&T** | match the held method to a technique record (a record whose `enables` recipe resolves to the Reality process that produced the outcome, KNT-12). The holder enters the stock (`known` for that mind's society); `invented` needs skill ≥ minSkill **and** a recorded success from step 3 (`capability.ts:55`) | stock and capability events with cause `individual_invention` |
| 6 transmit | Society network (KNT-S1), Cognition communication | others learn by talk, demonstration, apprenticeship, records | new holders through 3.5 |

**Guarantees.** K&T never grants an invention that skipped step 3: `invented` reads a success that only Reality's
outcome can supply, and a method with no resolving process (KNT-12) cannot be matched. The states stay distinct.
*Discovery* is step 4 (a holder exists). *Invention* is a working method that succeeded here. *Adoption* is a
producer's choice (3.6). *Retention* is whether a holder or a readable record survives the discoverer (3.2, 3.3).
None implies the next. **Gap KNT-13:** step 5 needs a rule for a method that matches no existing technique record.
Proposed: K&T reports an unmatched method and does not mint a technique at run time; whether a new record is ever
minted is for Rex. Steps 1 and 4 wait on Cognition's plan (KNT-6, KNT-7).

**3.7b Any aggregate approximation comes back separately (Rex).** The present code (`λ_inv = E·q`, a scalar q) and
the RESEARCH candidate `q = q0·σ^m·h(τ)` are **not approved forms**. A later proposal must define each of these, and
it is reviewed on its own, not inside this plan:
1. every variable and its unit, and **why σ is squared** (the Weitzman m = 2 pairing counts candidate pairs of known
   pieces. That is a size of the candidate pool, not a success probability, and the argument must be made or the
   exponent dropped);
2. whether q is a **rate** (per person-hour, so λ = E·q per year) or a **probability** per trial. For a constant rate
   under a Poisson assumption, the probability over a step is `1 − e^{−λΔt}`, never `λΔt`;
3. **what counts as an invention**: the first recorded success here of a technique in the data, by the 3.7a step 5
   rule;
4. **calibration data separate from validation data**: named sets, the split fixed before any run;
5. a **no-double-counting rule** with simulated individual inventions. Proposed: the aggregate hazard applies only to
   a society running at aggregate resolution and only while no agent-resolution mind in it is modelled. At a
   resolution hand-off the pending hazard is dropped, not carried, and an individual invention is never also counted
   as an aggregate event.

**Gap KNT-11** (carried): an aggregate form that depends on σ needs some propositions known first, and aggregate
*discovery* of propositions has no mechanism.

**3.8 Media** (`knowledge.media.availability`, DESIGN §1.8, `src/media.ts`). Chain: capability states with deployed > 0
and `isMedium` → media list; user share = holders of the medium technique / population (for writing, those who can read
and write the script; ruling 2026-11-01). Physical properties (persistence, range, fidelity) are Reality's
`world.medium_properties` keyed by technique id. **Confirmed defect KNT-8** (by code read): `media.ts:27-30` still keys
user share on a `medium.kind` descriptor; `data/techniques/writing.json` has none, so writing gets `kind: null,
userShare: null`. Fix: user share from the stock's holder count of the medium technique over N_s; drop the descriptor.

**3.9 Technique → physical capability (new; the causal-loop link).** A technique changes the world one way only: it
adds a method (an Economy recipe whose transformation is a Reality process) to what a holder can execute. The change in
work, energy, time, force or yield is computed once by the owner of that recipe and process; K&T records only the link.
Contract (KNT-12 with Economy, KNT-R1 with Reality): every id in `enables` resolves to an Economy recipe that names its
Reality process; a check reports any technique whose chain does not resolve. Both data techniques fail it today (opaque
ids; see their `notes`). Per technique:

| Technique | Method it makes executable | Physical capability changed (owner) | Work / labour capability changed (owner) | Exists today |
|---|---|---|---|---|
| lime burning (`data/techniques/lime-burning.json`) | recipe quicklime | Reality: thermal decomposition of limestone to quicklime and CO₂ in a kiln (reaction, heat, fuel); mortar setting as a material property | Settlement: construction projects needing mortar become possible; their person-hours are Settlement's | no recipe; no Reality calcination process (named only in `realism/MIGRATION.md`) |
| writing (`data/techniques/writing.json`, medium) | recipe written-record | Reality: a record object with mass, medium decay, fidelity | none physical; opens K&T's record channel (3.5) and the literate share | no recipe; KNT-8 |
| hafted edge-tool use (M2, planned record) | felling, splitting, shaping with an edged tool | Reality mechanics (P2, planned): force and energy per cut from tool mass, edge and wood properties | Life: metabolic cost and fatigue of the work done; Settlement: person-hours per unit derived, not a host constant | Reality P2 not built; `productivity()` is a host skill-band table (`settlement/src/providers.ts:19`, `economy/src/providers.ts:53`) |
| fire making, charcoal burning | fire on demand; charcoal | Reality combustion (`carbonCombustion`, `realism/src/process.ts:9`) | Economy fuel recipes | combustion exists; no technique record |
| food preservation (drying, salting, smoking) | preserved-food recipes | Reality/Life: decay rate of a food stock | longer-lasting reserves enter Cognition's need decisions | no |
| cooking | cooked-food recipes | Life: digestible energy of food | — | no |
| cultivation (sowing, tillage, irrigation; M3) | planting and field recipes | Life plant growth; Reality soil water and nutrients | Settlement field labour | Life plant model planned (M3) |

Assumption: methods are discrete (held or not, skill on one scale). Stops applying where a better tool or furnace
modifies an existing method: that is a different *good* (Economy) used by the same recipe, never a technique-to-technique
link (invariant 1).

**3.10 Resolution split** (DESIGN §1.7, Rex KNT-Q4): agent resolution, Cognition decides discovery, learning and
adoption, K&T aggregates; aggregate resolution, K&T's hazards (3.3, 3.5–3.7) run and must match the agent mean.
**Exclusive ownership on a resolution change (KN-9):** each simulated person, learning event and adoption update has
exactly one owner at a time, either the agent run or the aggregate. A switch neither creates holders nor applies a
transmission twice. Pending aggregate hazards are dropped at a hand-off, not carried. Replay with the same seed across a
switch is byte-identical.

### 4. Inputs and outputs

| Quantity | Producer → consumer | Unit, range | Timing | Failure / rollback |
|---|---|---|---|---|
| holder report (heard-of / holds, skill) | Cognition → `knowledge.port.holders` (KNT-C1 agreed) | per mind; skill [0,1] | event (belief crosses θ_hold) | missing = not reported (lowers coverage), never "not a holder" (corrected 2026-11-03); a stub that never reports forgetting is flagged "false survival" |
| skill practice and decay | Cognition `cognition.skill.practice` → `mind.skill` port (Cognition PLAN A.4) → holder report; the same value goes to Settlement `labour_cap` (DC-14) | 1, [0,1] per technique, fraction of expert performance | daily or per practice outcome | **interface KNT-7**: units agreed; form, rates, decay (Arthur et al. 1998), initial values and performance measure open for Rex; fixture skill until the port exists |
| deaths, departures | Life, Society → `knowledge.port.deaths` | per person | event | unreported death = holder survives (flagged on stubs) |
| contact rates m, c, v, ρ per pair per channel; within-society density q_c; contact weights w_st; literacy teaching | Society → `knowledge.port.contact` (**interface KNT-S1: waits on Society; not yet raised**) | per year ≥ 0; null = unreported | per step | null throws (`diffusion.ts:35-38`); never defaulted |
| record objects (item, fidelity, script, intact) | Economy goods + Reality decay → `knowledge.port.records` | count; fidelity [0,1] | event | a record in two places is a conservation failure |
| feasibility per recipe | Reality → `knowledge.port.feasibility` (KNT-R1) | boolean / null | on change | null ⇒ `possible` null, never true |
| reach per recipe | Economy, Reality → `knowledge.port.reach` | boolean / null | on change | as above |
| cost advantage Δc_i and c_old,i per producer | Economy → `knowledge.port.incentive` (KNT-E1/E2) | Economy's cost units, smoothed | per step | missing ⇒ M = 0 (no adoption), flagged |
| production by recipe, successes, producers using | Economy → `knowledge.port.production` | count; share [0,1] | per step | share outside [0,1] throws (`capability.ts:47-49`) |
| experimentation hours E | Economy labour + Cognition intentions → K&T | person-hours/yr | per step | absent ⇒ λ_inv = 0 |
| `society.capability_state` | K&T → Economy gate, Government, History, adapters | §2 | on input event | pure recompute; rollback = recompute from the rolled-back snapshot |
| `society.knowledge_stock` | K&T → capability state, History; **never Cognition** (DUP-61 test 5) | §2 | on input event | pure recompute |
| `society.available_media` | K&T → Reality/Cognition communication | list | on change | derived |
| method gate | K&T → Economy recipe run (KNT-E1) and Settlement `labour_cap` (DC-14) | boolean + skill | each production call | gate false, or `possible` not true (IT-INV-1) ⇒ recipe not run, no partial transfer |
| aggregate A, z̄ | K&T internal | §2 | per step / generation | restored from the kernel snapshot |

**Transfers:** K&T owns none. Record objects move by Economy's transfer; people move by Society's migration; a
technique "moving" is only a new holder or a delivered record, counted once, by its carrier's owner.

### 5. Evidence

Labels: **measured** (from data), **calibrated estimate** (fitted to named data), **assumption** (keeper's reasoning or
a theory without a fitted form), **fiction** (fixture numbers). No calibrated estimate exists yet.

| Item | Source | Label | Level |
|---|---|---|---|
| five distinct states | Mokyr 2002 Ω/λ; Rogers 2003; Rex PLATFORM §6, KNT-Q1 | assumption (structural, Rex-approved) | 3 |
| tacit share blocks records-only transfer | Collins 1974; Polanyi 1966 (neither opened by RESEARCH) | assumption, qualitative | 3 |
| exponential arrival per channel | Poisson-process maths | law | 1 |
| π_practise, π_tell, π_infer, π_read | none | open (null) | 4–5 |
| spatial decay of contact | Hägerstrand 1967, via Society | not K&T's | 2–3 |
| Henrich Δz̄ form; γ | Henrich 2004; Gumbel maximum; Acerbi replication (opened) | form assumption with level-2 support; γ a constant | 4 / 1 |
| α, β | no empirical estimate; α = 7, 9, σ = 1 are tutorial settings | open; tutorial values only as verification fixtures | 6 |
| population–toolkit relation | Kline & Boyd 2010, Collard 2013 for; Collard 2005, Read 2006, Vaesen 2016 against | measured, contested | 2 |
| S-shape; slope and ceiling rise with profit | Griliches 1957 (abstract); Dixon 1980 (findings not read) | measured direction; shape open | 2 |
| heterogeneous thresholds | Van den Bulte & Stremersch 2004 | measured direction | 2 |
| Bass form | Bass 1969 (not opened) | assumption with level-2 support | 2 |
| p, q values | Mahajan, Muller & Bass 1995 / Sultan et al. 1990 (secondary; attribution uncertain) | modern products only; test bracket | 2, not for pre-modern |
| κ | none | open | 5 |
| q = q0·σ^m·h(τ) | Weitzman 1998 structure (m = 2 baseline); h none | assumption | 5 / 6 |
| minSkill, τ per technique | none yet | open (null in `data/`) | — |
| KD-1 numbers (minSkill 0.5, τ 0.3, rates) | `fixtures/kd-1/` | fiction | 6 |
| record survival | Kestemont et al. 2022; Buringh 2011 (not opened) | open, Reality's decay | 2–3 |

**Doc defect KNT-9 (from RESEARCH):** DESIGN §1.2 says Read 2006 attributes Tasmanian change to "environment and
risk"; Read's abstract says adequate technology and changed resource procurement. DESIGN §4's hold-out "Vaesen et al.
2016 hunter-gatherer data" is a review, not data; the hold-out is Collard et al. 2005. Sources to add: Dixon 1980;
Sultan, Farley & Lehmann 1990; Van den Bulte & Stremersch 2004; Mahajan, Muller & Bass 1995; Collard et al. 2005, 2013;
Derex et al. 2013; Muthukrishna & Henrich 2016.

### 6. Status

D designed · I implemented · C connected · N numerically checked · V empirically validated.

| Mechanism | D | I | C | N | V |
|---|---|---|---|---|---|
| 3.1 capability state | yes | yes `capability.ts` | no (stubs; `kernel.json` `"ports": []`) | yes `test/capability.test.ts`, CHECK-1 #4 | no |
| 3.2 stock with loss | yes | yes `stock.ts` | no | yes `test/stock.test.ts`, `test/dup61.test.ts` | no |
| 3.3 copying per generation | yes | formula only `copying.ts`; no generation step | no (KNT-7, KNT-5, KNT-10) | formula `test/copying.test.ts` | no |
| 3.4 requirements + gate | yes | schema and checks; gate no | no (KNT-E1) | `schema.test.ts`, `check.test.ts`, `fence.test.ts` | — |
| 3.5 diffusion | yes | yes `diffusion.ts` | no (KNT-S1) | yes, KD-1b mean vs 1/h | no |
| 3.6 adoption | yes (this plan) | Bass yes; cost-advantage form no | no (KNT-E2) | Bass `adoption.test.ts`; KD-1g skipped | no |
| 3.7 invention, aggregate | off for M1a–M2 (Rex); form not approved (§3.7b) | E·q, q scalar, switch off | no | `invention.test.ts` | no |
| 3.7a invention, individual chain | yes (this plan) | no (needs KNT-6, KNT-7, KNT-12, KNT-13) | no | no | no |
| 3.8 media | yes | yes, with defect KNT-8 | no | `media.test.ts` (descriptor path only) | — |
| 3.9 technique → physical capability | yes (this plan) | no | no (KNT-12, KNT-R1) | no | no |
| coverage, three-valued availability, demonstrated-here / currently-executable split (KN-2, KN-4) | yes (review 2026-11-02) | no (KNT-15, KNT-16) | no | no | — |
| method access contract (KN-5) | yes | no | no (CP-2) | no | — |
| KD-1 demonstration | yes | yes `kd1.ts`, all stubs, fiction | stubs | a b c d e f h i pass; g skipped | — |

### 7. Validation

**Verification (every unit):**
- 3.5: mean arrival over ≥ 200 seeds within the 95 % interval of 1/h (exists, KD-1b).
- 3.6: Bass step against the closed-form Bass solution, max relative error ≤ 1 % at dt ≤ 0.01/(p + q); A never exceeds
  M; M falling below A clamps A. KD-1g: with κ > 0 (fiction) the 10 %→90 % time strictly falls as r rises and as q_c
  rises; with κ = 0 the ceiling still rises with the number of positive Δc_i.
- 3.3: `criticalSize` equals exp(α/β − γ) to 1e-12; a Gumbel learner simulation (fixture α = 7, 9; β = 1; N from 10² to
  10⁴; ≥ 50 generations each) reproduces slope β and intercept −α + γβ of Δz̄ on ln N within three standard errors;
  N* within 10 % of the Acerbi tutorial's 639 and 4806.
- 3.1/3.2: fences (no tech tree, no dates, no stored stock, separate predicates, imports), conservation (one society per
  mind, one place per record), determinism (KD-1i).
- 3.8: writing with no descriptor and H holders of N gives user share H/N (closes KNT-8).
- 3.9: every technique in `data/` resolves technique → recipe → Reality process, or is reported unresolved.

**Integration (only when a port's contract changes):** holder port with Cognition (KNT-C1, KNT-7); gate and incentive
with Economy (KNT-E1/E2); contact with Society (KNT-S1); feasibility and record decay with Reality (KNT-R1); agent vs
aggregate agreement (invariant 3): mean arrival time and mean adoption curve within 10 % over the same inputs, ≥ 200 seeds
(tolerance proposed now, fixed before the run).

**Empirical validation (periodic; independent data, never the data that set a parameter):**

| Target | Data | Indicator and tolerance (set before the run) |
|---|---|---|
| toolkit vs population and contact | Kline & Boyd 2010 (development); Collard 2013 (held out, expect positive); Collard 2005 (held out, expect weak or null) | sign of the slope of log tool count on log population, magnitude within each study's 95 % CI; Henrich on and off both reported |
| S-curve, faster with profit | Griliches 1957 (κ calibrated on a subset of states); held-out states; Ryan & Gross 1943 | logistic R² ≥ 0.9; Spearman ρ(speed, profit) > 0 on held-out states |
| records-only tacit failure | Collins 1974 | qualitative KD-1d pattern |
| between-society lags | Comin & Hobijn 2010 | lag distribution, P11 benchmark only |
| record survival | Kestemont 2022; Buringh 2011 | through Reality's decay; stock loss compared |

Explicit uncertainty is the honest result at civilisation scale; a failed validation is investigated, never tuned.

### 8. Build order: nine lanes, four checkpoints (review 2026-11-02; all after Rex lifts the STOP and approves)

**Knowledge is not on M1a's path.** Prepared bread with supplied starting knowledge needs no live Knowledge engine.
These lanes are a **parallel track**, not a blocking sequence for any other engine. Invention is deferred (§3.7): its
interface (§3.7a step 5) is preserved, and no checkpoint depends on it. Some lanes need equations. Others need exact
counting and state-transition rules, and there an exact accounting rule is used rather than a speculative equation.
For counting and reference lanes, "realism" means the meaning and completeness of the inputs; there is no coefficient
to fit.

**8.1 Lanes.** Each lane gets one seven-item card: question, boundary, model, evidence, functional tests, realism
tests, connection test.

| Lane | Determines | Main work | Acceptance case | Plan § |
|---|---|---|---|---|
| KN-1 method identity and requirements | what a technique refers to; which processes implement it | versioned technique → recipe → physical-process links; prerequisites vs alternative methods | a broken reference stays unsupported; a technique record never creates a physical capability | 3.1, 3.4, 3.9 |
| KN-2 holders and collective stock | who holds, has heard of, or can access a recorded method | Cognition holder reports + Society population accounting, with coverage | repeated reports never duplicate holders; missing reports never pass as forgetting | 2, 3.2 |
| KN-3 records and readability | whether information survives outside practitioners and can be reached | physical record, condition, script competence, access (owners' assessments) | a surviving document preserves information without giving anyone its skill | 3.2 |
| KN-4 demonstrated capability and use | feasible, demonstrated here, currently executable, used, deployed | tighten the separate meanings | losing a practitioner changes present capability, never deletes a past demonstration | 2, 3.1 |
| KN-5 method access during action | whether an actor has the method available for deliberate execution | individual knowledge → Cognition's candidates and the execution contract | one expert never makes every resident an expert; attempts still resolve physically | 3.4 |
| KN-6 transmission and diffusion | how a person or community gains access | agent-level learning events first; aggregate arrival model separately | contact or receipt of a document is distinguishable from learning | 3.5 |
| KN-7 adoption and deployment | who uses a technique; what production results | derive agent-level use; aggregate adoption only under declared assumptions; first adoption = p among eligible producers or one choice, one record, counted once | knowing never forces adoption; adoption never guarantees output; an arrival never counts as an adoption | 3.6 |
| KN-8 loss and retention | what disappears by forgetting, death, departure, record decay | individual losses derived; generational copying experimental | last holder leaves, readable record survives, later someone learns: each state changes for its reason | 3.2, 3.3 |
| KN-9 resolution changes and replay | consistency of individual and aggregate representations | exclusive ownership of people, learning events, adoption updates | a switch neither creates holders nor applies transmission twice | 3.10 |

**8.2 First cards (the keeper drafts units only from these).**

**KN-1 method identity and requirements.**
1. *Question:* what is a technique, and through which recipes and processes can it be carried out?
2. *Boundary:* K&T owns the record and its links. Economy owns recipes, Reality owns processes and feasibility. A
   record never creates a capability.
3. *Model:* versioned record; `enables` split into `alternatives: [recipe]` (OR) and per-recipe requirements (AND),
   Kleene three-valued (§3.1). Each link carries a version and resolves technique → recipe → process (KNT-12).
4. *Evidence:* structural; each link cites the recipe's and the process's own source; Catalogue `documented_prerequisite`
   may be cited by writers, never read at run time (KNT-K1).
   Issues are labelled against this contract: KNT-15 (AND over every recipe) is a defect only where the recipes are
   declared alternatives.
5. *Functional tests:* one working alternative beside one unavailable alternative ⇒ possible; all impossible ⇒
   impossible; any unknown and none true ⇒ unknown, naming the missing input and producer; a broken or unversioned
   link ⇒ unsupported; no technique names a technique (existing fence).
6. *Realism tests:* each data technique's alternatives match its sources' description of how it was done (lime
   burning: kiln types as alternatives, fuel and stone as requirements).
7. *Connection test:* when Economy and Reality publish recipe and process ids, every `data/` link resolves or is
   reported unresolved; nothing becomes possible from the record alone.

**KN-2 holders and collective stock.**
1. *Question:* how many people in s hold, or have heard of, k, and how complete is that count?
2. *Boundary:* Cognition says who holds (KNT-C1, `mind.skill` KNT-7); Society says who is in `P_s` and the expected
   population; K&T counts, never infers.
3. *Model:* `H` and `H^heard` as distinct-person sums, each with coverage `C_s` (denominator: Society's roster) and
   snapshot time; availability by the three-valued rule (§2, §3.2). **Ruling on the 5534 park (2026-11-03):** the
   KD-1 fixtures and runner simulate every person of A and B, so they supply complete coverage by construction (a
   roster and a reported-minds list of all simulated people, tick = step). KD-1a's "B does not know" then reads
   availability = false exactly as before; renaming `known` to `availability` is the KNT-Q1 mapping, not a changed
   expected value. A fixture that omits coverage gets unknown, which is correct.
4. *Evidence:* exact accounting; no coefficient.
5. *Functional tests:* a duplicate report counts once; a mind in two societies is a conservation failure (exists);
   a partial snapshot reports confirmed holders plus coverage, never a total; a zero below full coverage is unknown,
   not absent; a missing snapshot is unknown, not lost; a departure without death moves the holder and changes no skill.
6. *Realism tests:* inputs complete (every person in `P_s` either reported or counted as missing).
7. *Connection test:* with Cognition's holder port and Society's population accounting live, counts equal the
   distinct holders in Cognition's state at full coverage.

**KN-4 demonstrated capability and use.**
1. *Question:* for (s, k): possible, demonstrated here, currently executable, used, deployed, each for its own reason?
2. *Boundary:* Reality outcomes make a demonstration (via Economy's success record); Economy reports use and output;
   K&T derives the states, writes no output.
3. *Model:* §2 and §3.1: demonstrated-here as a retained event; currently executable = available holder ∧ access ∧
   conditions; the two **independent** (KNT-Q6, accepted); deployment ratio with declared product, basis, unit and interval; zero total ⇒ undefined.
4. *Evidence:* definitions from KNT-Q1 (Rex), Mokyr and Rogers (level 3); no coefficient.
5. *Functional tests:* the last practitioner leaves ⇒ currently executable becomes false or unknown, demonstrated
   here stays true; a holder arrives with conditions met ⇒ currently executable true while demonstrated here is still
   false; a ratio with mismatched product, basis, unit or interval is rejected; `Q_g = 0` ⇒ undefined;
   no state is computed from another (existing CHECK-1 #4); writing with no descriptor gives user share H/N (KNT-8).
6. *Realism tests:* each state's inputs come from their owners, none from a fixture outside `fixtures/`.
7. *Connection test:* with Economy production and success reports live, a recipe run by a holder sets demonstrated
   here once and deployment from Economy's own numbers.

**KN-5 method access contract** (contract only at CP-1).
1. *Question:* when can actor i deliberately use method k?
2. *Boundary:* K&T answers availability; Cognition generates candidates and decides; Reality and Life resolve the
   attempt; Settlement `labour_cap` reads the same gate (DC-14).
3. *Model:* `HasMethod(i,k) = Holds(i,k) ∧ RequirementsMet(i,k)`; minSkill = competence threshold of the production
   abstraction; IT-INV-1 (no runnable recipe without feasibility) (§3.4).
4. *Evidence:* structural; the skill-execution precedent is `realism/src/process.ts:17-23`.
5. *Functional tests:* one expert in a village ⇒ only that person has the method; holding without requirements ⇒ no
   method; `possible` unknown ⇒ not runnable; a below-minSkill holder is not competent labour for the recipe but is
   not barred from an attempt.
6. *Realism tests:* none beyond input completeness.
7. *Connection test:* at CP-2, one supported task where Cognition offers the candidate only to holders and Reality
   resolves every attempt.

Cards for KN-3, KN-6–KN-9 are drafted when their checkpoint opens, from §3.2, §3.5, §3.6, §3.3 and §3.10.

**8.3 Checkpoints.**

| CP | Lanes | Needs | Demonstrates | M |
|---|---|---|---|---|
| 0 | — | Rex's approval | PLAN landed in the repo (composer copy unit); DESIGN header points to PLAN; KNT-9 doc fixes (composer); registry row contracts sent (one message) | — |
| **CP-1 truthful knowledge accounting** | KN-1, KN-2, KN-3 (labelled fixture access), KN-4, KN-5 contract | nothing live; labelled holders and records | presence, loss, surviving records and unknown inputs, each correct. Passes while correctly reporting unknowns; it does not need every fact known. Fixes KNT-8, KNT-14 (as a labelled assumption), KNT-15, KNT-16; Bass closed-form verification only | parallel |
| **CP-2 a method used by an individual** | KN-5 live on one supported task | Economy recipe (KNT-E1), Reality P2 process, Life work cost, Cognition candidates | KD-2: one worker, the same tree, with and without the hafted-edge technique; K&T identifies the method; the other engines compute execution and outcome. Paired: holder (task done, reserves hold) vs no holder (no method available; reserves fall through the specified states) | **M2** |
| **CP-3 transmission and retention** | KN-6, KN-8 at individual resolution | Cognition learning and `mind.skill` (KNT-7); Society contact and membership events (KNT-S1) | one person learns through Cognition, becomes a holder, and can attempt the method; loss and recovery tested (last holder leaves, record survives, someone learns again) | M5 prep |
| **CP-4 aggregate approximation** | KN-6–KN-9 aggregate halves | only when aggregate simulation is needed; CP-3 | aggregate arrival, Bass with the exact constant-input update and the three recorded fall causes (§3.6; draft 5610) (and only then the κ hypothesis, KD-1g), Henrich (if KNT-10, KNT-5 are settled), compared with matched individual runs; KN-9 exclusive ownership | M5 |
| later | §3.7a invention chain; cultivation and preservation records (M3/M4); §7 empirical validation | Cognition `decision.generate` (KNT-6), KNT-12, KNT-13; Life M3/M4 | — | — |

**Superseded in DESIGN:** §1.6 all-or-nothing `M_s` (now §3.6); §1.8 medium descriptor (ruling 2026-11-01; code lags,
KNT-8); §1.2 Read wording and §4 hold-out (KNT-9). **Gaps named:** aggregate proposition discovery (KNT-11); Henrich
scale mapping (KNT-10); technique → physical capability resolution (§3.9, KNT-12).

**Open items:** KNT-Q6 answered (independent states, 2026-11-02); KNT-13 (an unmatched invented method: report only, or mint a record; Rex); KNT-Q5 answered (aggregate
invention off for M1a–M2, Rex 2026-11-02); KNT-7 (Cognition skill practice, interface); KNT-S1 (Society contact port,
interface); KNT-E1/E2 (Economy); KNT-R1 (Reality); KNT-5 (generation window); KNT-6; KNT-4 (all constants null).

## Log

| Date | What |
|---|---|
| 2026-11-02 | Pass 1 written and reported to the controller; pass 2 written (successor keeper). Consolidates DESIGN and RESEARCH; adds §3.9 technique → physical capability and the KD-1g cost-advantage form |
| 2026-11-02 | Rex, KNT-Q5: aggregate invention off for M1a–M2; §3.7 rewritten: limitation recorded, individual invention as a cross-engine chain (§3.7a), requirements for any aggregate form (§3.7b); KNT-13 opened |
| 2026-11-02 | Registry INTEGRATION-PLAN: DC-14 (productivity derived in Settlement `labour_cap`; the gate is a port Settlement reads) folded into pass 1, §3.4, §4; chain INV-01..07 and IT-INV-1 cited in §3.4, §3.7a |
| 2026-11-02 | Cognition PLAN A.3/A.4: `mind.skill` is [0,1], a fraction of expert performance; z and minSkill use it (§2, §3.3, §4); form, rates and performance measure stay open under KNT-7 |
| 2026-11-02 | Review (pre-reviewed, adopted with its corrections): nine lanes KN-1–KN-9 and checkpoints CP-1–CP-4 replace the stage table (§8); exact counting with coverage, three-valued availability, unknowns naming missing input and producer, freshness as a status (§2, §3.2); `enables` alternatives vs prerequisites (§3.1); demonstrated-here / currently-executable split (§3.1, KNT-Q6); deployment basis; method access ≠ success, minSkill reconciled (§3.4); directional migration, artefact channel, arrival probability (§3.5); Bass restricted, abandonment separate, comparable costs, p vs diffusion (§3.6); Henrich experimental (§3.3); KN-9 ownership (§3.10). Defects KNT-14–17. K&T stated off M1a's path |
| 2026-11-03 | Review closed: clarifications reconciled; exact Bass update moved to CP-4 (5538 kept); duplicate re-run drafts withdrawn; remaining unit gaps: 5534 (roster, KD-1 ruling) and 5536 (share convention, roster) |
| 2026-11-03 | Review of the active models (pre-reviewed, with its qualifications): coverage denominator = Society's roster, empty roster not applicable (§2); share convention = output produced using the method, partitioned only for a declared comparison group; has adopted / currently executable / used now kept apart (§3.1); reading may feed learning but never counts as a demonstration, KD-1 runner shortcut confined to fixtures (§3.2); summed hazards kept, overlap prevented by defining opportunities first and processing each explicit event once, quantity kinds declared at seams (§3.5); exact Bass update for fixed conditions replaces Euler, A ≤ H not imposed, three recorded causes of A falling replace the clamp (§3.6). κr, copying loss and aggregate invention stay deferred. KN-2 park ruled: KD-1 fixtures and runner supply full coverage (§8.2 KN-2) |
| 2026-11-02 | Final clarification (review closed): KNT-Q6 accepted, the two states independent; Bass p kept: first adoption is a p event among eligible producers (or one choice), counted once, arrivals change M only; defects labelled against their contracts (KNT-15 only where recipes are alternatives). Cards KN-1, KN-4 and the KN-7 row updated. K&T stays parallel to M1a; implementation waits on approval and the interface agreements |
