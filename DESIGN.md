# Knowledge & Technology: design (P9, Knowledge & Technology keeper, 2026-10-31)

**Status: approved (Rex, 2026-10-31)**: KNT-Q1–Q4 as proposed (§5). The lane `knowledge` is released by its approval
marker unit. Every item is marked **(Rex)** = Rex's decision, **proposed** = this keeper's proposal, or **open** =
a question for Rex or another owner (§5, prefix `KNT-Q`). Evidence levels are PLATFORM §4: (1) physical or mathematical
law, (2) empirically supported statistical relationship, (3) historical observation and interpretation, (4) simplified
simulation approximation, (5) hypothesis, (6) fiction. Every constant here is **null with a flag** until a research unit
sets it from a named source; no value below is invented.

**Most of this engine is level 3–5.** Two parts rest on strong empirical regularities: S-shaped adoption whose speed
rises with profitability (Griliches 1957, level 2) and the positive relation between population plus contact and the
size of a society's toolkit (Kline & Boyd 2010, level 2, from ten Oceanic societies). The rest is labelled.

## 0. Scope, and what this engine never owns

**(Rex, PLATFORM §6, ENGINE_MAP §10)** A society develops a technology from resources, knowledge, tools, manufacturing
capability, energy, skilled labour, incentives, institutions, communication and experimentation; earlier than history
if the capabilities exist, never if they don't. **Possibility, knowledge, invention, adoption and deployment are
distinct states. Never a tech tree.** Collective knowledge is recorded and transmitted knowledge **with loss**, carried
on Society's network.

Knowledge & Technology owns:

1. **The capability state** of each (society, technique): which of the five states it is in, and why (§1.1).
2. **The collective knowledge stock with loss**: what a community knows, held in living minds and surviving records,
   and how it is lost (§1.2; row `knowledge.collective.stock`).
3. **The knowledge side of a technique**: what a recipe requires *in knowledge* before Economy can run it: the
   propositions it rests on, the skill it needs, and how much of it is tacit (§1.3). Never its materials, tools,
   labour or energy, which stay in Economy's recipe.
4. **Diffusion between communities**: how a technique held in one place arrives, or fails to arrive, in another,
   through which channel and at what fidelity (§1.4; row `knowledge.technology.diffusion`).
5. **Invention and adoption at aggregate resolution** (§1.5, §1.6): the community-level hazard of a new technique and
   the S-curve of its uptake, used when a settlement runs as an aggregate. At individual resolution these are
   Cognition's choices and this engine only aggregates them (§1.7).
6. **Media availability**: which media a society has and who can use them (§1.8; row `knowledge.media.availability`).

| Never Knowledge & Technology's | Owner | How this engine gets it |
|---|---|---|
| An individual's beliefs, skill, discovery from experience, decision to try or adopt a technique | Cognition (`cognition.belief.update`, `cognition.skill.practice`, `cognition.learning.*`, `cognition.decision.*`) | a holder port: per mind, does it hold technique k and at what skill (§2, KNT-C1) |
| Who talks to whom; the network a message or a migrant travels | Society (`society.network.communication`, DUP-60) | a contact port: rates between communities by channel |
| A message's content, comprehension and belief change | Cognition's communication subsystem | never read; the stock reads its *result* (a new holder) |
| Physical feasibility of a process; medium properties (range, persistence, fidelity) | Reality (domain A manufacturing feasibility; `shared.communication.medium`) | a feasibility port; a medium-properties port |
| Materials, tools, equipment, labour and energy of a recipe; production; prices; record objects as goods | Economy (`Recipe`, `economy.goods.record_object`) | a recipe port; a cost-advantage port (incentive); a record-object port |
| Births, deaths, ages | Life (later Society demography) | a deaths port: a holder who dies leaves the stock |
| Schools, guilds, scribes, priests as institutions | Society | through the contact port (an apprenticeship is a channel) and a literacy share |
| Censorship and suppression | Government | through Society's contact rates and Cognition's communication |
| Reference dates of discovery, invention, adoption | Catalogue | read only for game configuration (initial stocks) and as History's validation baseline; **never read by any mechanism here** (§0 invariant 2) |
| What happened (the backend record) | History | never read (ENGINES.md, Rex 2026-10-31) |

**Invariants (proposed, from Rex's rules):**

1. **No tech tree.** No technique lists another technique as a prerequisite. A technique requires knowledge
   propositions, a skill and the recipe's physical inputs; dependence between techniques emerges only because a tool
   or material is itself a good made by another recipe. A check test fails if any technique record names a technique.
2. **No date reads.** No mechanism takes a calendar year, a Catalogue date or a period as input. A fence test asserts no
   `kernel.json` process of this engine reads `catalogue.*` dates or `history.*`.
3. **The stock is an aggregate, never a second truth.** It is computed from minds (through Cognition's holder port) and
   from surviving record objects (through Economy); it holds no knowledge of its own. At aggregate resolution, its
   cohort state must equal the mean of the agent-resolution run within a stated tolerance (ROADMAP P1 aggregation rule).
4. **Minds never read the stock.** The stock is objective state; a person learns what others know only by
   communication, observation and reading (Cognition §1 fence, extended).
5. **Loss is real.** Every unit of knowledge has a living carrier (a mind) or a physical carrier (a record object that
   decays by Reality's rules). When both are gone, the item is lost; nothing restores it but re-invention or
   re-discovery from evidence.
6. **States are not derived as copies of one another.** Knowing a technique never implies its invention in this
   community, invention never implies adoption, adoption never implies deployment (the same discipline as Rex's
   transmission ≠ comprehension ≠ acceptance ≠ compliance).

## 1. The mechanisms

### 1.1 The capability-state model (proposed row `knowledge.capability.state`)

For each society `s` (any community with a population: band, village, town, polity; Society defines it) and technique
`k`, five states, each a separate predicate computed from its own owner's inputs. They are **not a ladder**: a society
can deploy a technique it could not re-invent (it imported workers), know one that is impossible for it (no ore), or
hold the principle without a working method.

| State | Meaning (proposed; KNT-Q1) | Computed from | Example |
|---|---|---|---|
| **Possible** `P_s(k)` | the technique's process is physically feasible here and its inputs are within reach | Reality's feasibility of the recipe's process ∧ every input of every recipe `k` enables is reachable (local stock, extraction or trade route) | iron smelting is possible where ore, fuel and a furnace material are reachable |
| **Known** `K_s(k)` | someone in `s` holds the *principle* (knowing-that: the propositions `k` rests on), or a record in `s` that a living reader can comprehend carries it | collective stock §1.2: propositional holders or readable records `> 0` | a monk has read that ore yields metal in a hot charcoal fire |
| **Invented** `I_s(k)` | someone in `s` holds a *working method* (knowing-how at or above the technique's minimum skill) that has succeeded at least once here, whether developed here or brought in | collective stock §1.2: technique holders with skill `≥ k.minSkill` and at least one recorded success in `s` | a smith who has made a bloom of iron in this village |
| **Adopted** `A_s(k)` | at least one producer in `s` has chosen to use it for production, not trial | Economy production records attributed to a recipe of `k`, or Cognition intentions to use it, aggregated | one forge switched from bronze casting to iron |
| **Deployed** `D_s(k)` | the share of `s`'s relevant output made by `k`; a fraction, not a flag | Economy's production by recipe: `D_s(k) = Q_k / Q_good` over the goods `k` produces | 40 % of the village's blades are iron |

Reasoning (level 3): Mokyr (2002, *The Gifts of Athena*) separates propositional knowledge Ω (knowing what) from
prescriptive knowledge λ (techniques, knowing how) and shows the two move at different speeds; Rogers (2003,
*Diffusion of Innovations*) separates knowledge of an innovation from the decision to adopt and from implementation.
Rex's five states map onto these: possibility is physics, knowledge is Ω, invention is λ demonstrated, adoption is the
decision, deployment is implementation at scale.

**State changes are events**, each with a cause recorded on the kernel trace: `known` by transmission, reading or
discovery; `invented` by experimentation, a skilled migrant or apprenticeship; `adopted` by a producer's choice;
`deployed` rising or falling with production; and **every state can fall** (§1.2 loss; adoption abandoned when the
cost advantage reverses; possibility lost when a trade route closes). A society that loses its last iron smith drops
from invented to known (if a record survives) or to nothing.

**Output:** `society.capability_state` (record per society: per technique the four booleans, the deployment share,
holder counts, and the cause of the last change). Read by Economy (§1.3), Government, History, game adapters.

**Rate limiter:** none of its own; it is a pure function of its inputs, recomputed when one of them emits an event.
**Failure mode:** stale state if an input port fails to emit (a fence test checks every input change triggers a
recompute); a technique with no recipe link reports `possible = null`, never true.

### 1.2 The collective knowledge stock with loss (row `knowledge.collective.stock`, DUP-61)

**What is stored.** For each society `s` and knowledge item `j` (a proposition, or a technique's method):

```
H_s(j)   holders: living members of s who hold j (from Cognition's holder port at agent resolution;
         a cohort count by age band at aggregate resolution)
z_s(j)   best skill among holders (techniques only), in the units of cognition.skill.practice
R_s(j)   readable records: record objects in s carrying j (Economy) whose medium has not decayed
         (Reality) and for which at least one living member can read the script (literacy, §1.8)
f(r)     fidelity of record r: the share of j's explicit content it carries (set when written: the
         writer's own understanding × the medium's fidelity; never more than 1 − τ_j, below)
```

**Known and invented** are read from this: `K_s(j) = H_s(j) > 0 ∨ R_s(j) > 0`; for a technique `I_s(k)` needs a holder
whose skill reaches `k.minSkill`; records alone can make it *known*, never *invented* (§1.3 tacit share).

**Loss has four routes, each owned elsewhere and read here** (Rex: collective knowledge has loss):

| Route | Owner of the cause | What this engine does |
|---|---|---|
| a holder dies or leaves | Life (deaths), Society (migration) | the holder leaves `H_s(j)`; if it was the last, `j` drops unless a record remains |
| a holder forgets or loses skill | Cognition (ACT-R decay; `cognition.skill.practice` decay without practice) | the holder leaves when Cognition's holder port says so |
| a record decays, burns, is lost or destroyed | Reality (medium decay), Economy (the object moved, traded, destroyed) | the record leaves `R_s(j)` |
| no one can read the record | Cognition and Society (literacy, language) | the record stays as an object but stops counting toward `R_s(j)` until a reader appears (recoverable, not known) |

**The imperfect-copying effect at aggregate resolution (level 4, with level-2 support).** When a settlement runs as an
aggregate, the expected change in the best skill held for a technique between generations follows Henrich (2004,
*American Antiquity* 69):

```
Δz̄_s(k) per generation = −α_k + β_k · (γ + ln N_eff,s(k))
```

with `α_k` the mean copying loss of the technique (harder, more tacit techniques lose more), `β_k` the spread of
copying error (a learner sometimes exceeds the model), `γ` the Euler–Mascheroni constant (0.5772…, level 1, from the
Gumbel maximum), and `N_eff` the number of skilled models a learner can see: the community's holders plus contact-
weighted holders elsewhere (Society's contact port). Below the critical size `N* = exp(α_k/β_k − γ)` the technique
degrades and is eventually lost; above it, it can improve. This is the mechanism of the "Tasmanian effect" claim and
of Kline & Boyd's toolkit result. **Competing explanations kept (PLATFORM §4):** Read (2006, *American Antiquity* 71)
attributes Tasmanian toolkit changes to environment and risk rather than population size; Vaesen et al. (2016, *PNAS*
113) find no population–toolkit relation in hunter-gatherer data. The validation plan (§4) runs both.

At agent resolution the same effect is not computed: it emerges from individual learners copying the best model they
can reach (Cognition's skill practice plus Society's network). Invariant 3 requires the two to agree in the mean.

**Inputs:** holder port (Cognition), deaths and migration (Life/Society), contact rates (Society), record objects
(Economy), medium decay (Reality), literacy (§1.8). **Output:** `society.knowledge_stock` (registered, planned).
**Timescale:** event-driven at agent resolution (a holder change or a record change is an event); one step per
generation-length window at aggregate resolution (the window is the controller's/Society's resolution rule, open).
**Rate limiter:** at aggregate resolution, `N_eff` and `α_k, β_k`; at agent resolution, the rate of transmission
events Society's network delivers. **Failure mode:** silent loss (an item disappears with its last holder; reported
as a `knowledge.lost` event with the cause); false survival if a holder port is a stub that never reports forgetting
(flagged on every stub).

### 1.3 The knowledge side of a technique (proposed row `knowledge.technique.requirements`)

The answer to "what a recipe requires in knowledge before Economy can run it". A **technique** is a data record
(Rex: cards are data; techniques are data, never code):

```
technique k:
  id                    stable kernel id
  enables               [Economy recipe ids]          the recipes it makes runnable; materials, tools, labour,
                                                     energy and yields stay in those recipes, never restated here
  propositions          [knowledge item ids]          what one must know-that (e.g. "charcoal fire reduces ore")
  minSkill              [0,1] | null                  on mind.skill's per-technique scale (units Rex's, KNT-7);
                                                     null until researched
  tacitShare τ_k        [0,1] | null                  share of the method that cannot be carried by a record and
                                                     needs demonstration or trial (Polanyi 1966; Collins 2010)
  copyingLoss α_k, β_k  | null                        §1.2, per research unit
  catalogueRef          catalogue id | null           reference only: names, dates, origin; never read by a mechanism;
                                                     the full qualified id, of kind technology or practice
                                                     (`catalogue/technology.<slug>`, `catalogue/practice.<slug>`),
                                                     at the finest dated grain the sources support
  sources, evidence     per field
```

**The gate Economy reads (proposed, KNT-E1):** a recipe of `k` can run at producer `p` in society `s` only if a worker
assigned to `p` is a holder of `k` with skill `≥ minSkill` (agent resolution), or `I_s(k)` holds and the producer's
labour draws on the holder cohort (aggregate resolution). Skill below `minSkill` is not a block but a yield and failure
penalty owned by Economy's recipe rates (open with the Economy keeper; this engine supplies the skill, never the
penalty). This replaces the opaque `Recipe.knowledge: "common" | "learned" | "foreign"` label (`economy/src/state.ts`
line 34; pirate `GOODS.md §3f`), which is a static per-region label the audit flagged (`pirate.sci.knowledge_rule`).

**Why tacit share matters (level 3):** Collins (1974, *Science Studies* 4) found that laboratories which built a
working TEA laser had all had personal contact with a lab that already had one; written papers alone did not suffice.
Records carry `1 − τ_k` of a method. A reader of a record with `τ_k > 0` becomes a holder of the propositions and a
holder of the method at a skill reduced by the missing tacit part, and must close the gap by trial (§1.5) or contact.

### 1.4 Diffusion between communities (row `knowledge.technology.diffusion`, DUP-60, DUP-61)

A technique crosses from `s` to `t` only on a carrier. Society's network supplies who meets whom; this engine supplies
**what each kind of contact can carry** and the resulting hazard. Three channels (proposed; Rex's "trade, migration
and writing", ROADMAP P9):

| Channel | Carries | Hazard per unit time that `t` gains a holder of `k` (aggregate resolution) |
|---|---|---|
| **migration / apprenticeship** (a person moves or a learner spends time with a master) | propositions and method, tacit part included | `h_mig = m_st · (H_s(k)/N_s) · π_practise` |
| **trade and visits** (goods and short contact) | propositions by talk; method only by inference from the artefact (Cognition's `cognition.history.inference`) | `h_trade = c_st · (H_s(k)/N_s) · π_tell + v_st · π_infer(k)` |
| **records** (a record object travels to `t`) | propositions and the explicit `1 − τ_k` of the method | `h_rec = ρ_st(k) · L_t · π_read` |

**Holders and carriers (keeper, 2026-11-01, clarifying the formulas above):** only the person-carried terms scale with `H_s/N_s` (a migrant or a talker must be a holder). The artefact term `v_st · π_infer` and the record term `ρ_st(k) · L_t · π_read` do not: an artefact or a record already carries `k`, so it keeps carrying `k` after every holder in `s` is gone (the loss rule of §1.2 and DUP-61 amendment 2a). A reader in `t` gains the method at skill `fidelity ≤ 1 − τ_k` of the writer's skill (§1.3).

`m_st` migrants per year from `s` to `t`, `c_st` contacts per year, `v_st` artefacts of `k` reaching `t` per year,
`ρ_st(k)` records of `k` reaching `t` per year (Society's network and Economy's trade, read), `L_t` the literate share
of `t` (§1.8), `π_*` the probability that the carrier actually passes it on (practises it in the new place, tells it,
the artefact reveals its method, a reader comprehends it). All `π` are **null until researched**; they are level 4–5.

**Spatial decay:** contact rates fall with distance and travel cost, as Hägerstrand's (1967, *Innovation Diffusion as
a Spatial Process*) mean information field observed (level 2–3). This engine does not compute the decay; it inherits
it from Society's contact rates and Reality's routes. **No second distance gear.**

At agent resolution there is no hazard formula: a specific migrant who holds `k` arrives (Society), practises or not
(Cognition), and a specific neighbour watches and learns (Cognition's skill practice). The hazards above are the
aggregate of that chain and are validated against it (invariant 3).

**Rate limiter:** the contact rates (Society) and the `π` terms. **Failure mode:** no arrival when no channel carries
`k` (the correct result, not a bug); arrival of propositions without the method when only records travel (§1.3);
loss in transit when the only carrier dies on the way (Life).

### 1.5 Invention and discovery at aggregate resolution (proposed row `knowledge.invention.hazard`)

A technique that is **possible** in `s` and not known there can still appear, from experimentation. At agent
resolution this is Cognition's: a mind tries an action, Reality returns the outcome, Cognition's learning attributes
it and forms a new belief (an individual discovery); it becomes collective only when the discoverer is counted as a
holder and survives long enough to transmit it. At aggregate resolution:

```
λ_inv,s(k) = E_s(k) · q_s(k)        while P_s(k) ∧ ¬I_s(k)

E_s(k)  person-hours per year spent trying things in the domain of k: production in the neighbouring recipes plus
        deliberate trial, from Economy's labour records and Cognition's intentions (incentive enters here: people
        experiment where a better method pays, Allen 2009, level 3)
q_s(k)  probability per person-hour that a trial yields a working method; rises with the share of k's propositions
        already known in s (recombination: Weitzman 1998, level 5) and falls with τ_k (more tacit = more trial)
```

`q_s(k)` is level 5 and **null until a research unit proposes a form with a source**; the demonstration (§3) runs with
invention switched off or fixed per case so that the diffusion result is not confounded. **This is how "earlier than
history if the capabilities exist" is met:** nothing in the hazard reads a date; a society that has every proposition
and much experimentation in the domain can invent early, and one where `P_s(k)` is false never can.

**Rate limiter:** `E_s(k)` (experimentation hours are labour taken from production) and `q_s(k)`. **Failure mode:**
over-invention if `q` is set high (validated against independent invention counts, §4); no invention when `P_s(k)` is
false (correct).

### 1.6 Adoption and deployment at aggregate resolution (proposed row `knowledge.adoption.aggregate`)

Once `I_s(k)` holds, producers choose whether to use it. At agent resolution each producer's mind decides
(Cognition's evaluation of expected utility, with Economy's prices and costs as beliefs); this engine only counts
adopters. At aggregate resolution, the Bass (1969, *Management Science* 15) form, whose S-shape and whose speed rising
with profitability are documented for hybrid corn across US states (Griliches 1957, *Econometrica* 25, level 2):

```
dA_s/dt = (p_s + q_s · A_s / M_s) · (M_s − A_s)

A_s    producers in s using k
M_s    producers for whom k is possible, invented-in-reach (a holder they can hire or learn from) and cheaper:
       Economy's cost advantage > 0 (incentive); M_s falls to 0 if the advantage reverses (abandonment)
p_s    external influence: arrivals from contact (§1.4) and records
q_s    imitation: rises with within-society contact density (Society's network)
```

Deployment `D_s(k)` is then Economy's production by recipe; this engine reads it and never computes output.

**Rate limiter:** `M_s` (incentive and capability caps adoption) and `q_s` (contact). **Failure mode:** no adoption when
the cost advantage is negative even though the technique is known and invented (the correct result: Roman knowledge of
the aeolipile without deployment is the classic illustration, level 3); oscillation if `M_s` flips each step (the
cost advantage is read smoothed over a window, open with Economy).

### 1.7 Resolution: who owns what at each scale (proposed; KNT-Q4)

| Mechanism | Agent resolution (a nearby village in full) | Aggregate resolution (a distant village, a civilisation) |
|---|---|---|
| a discovery | Cognition: a mind's learning from an outcome Reality returns | this engine: `λ_inv` (§1.5) |
| learning from another | Cognition: skill practice and communication over Society's network | this engine: Henrich `Δz̄` (§1.2) and channel hazards (§1.4) |
| the decision to adopt | Cognition: a producer's choice | this engine: Bass (§1.6) |
| the stock, the five states, loss | **this engine at both resolutions** (an aggregate over Cognition's holders, or a cohort state) | **this engine** |

The aggregate forms are documented aggregation interfaces (refinement B), not second gears: each carries a test that
its mean equals the agent run within a stated tolerance over the same inputs.

### 1.8 Media availability (row `knowledge.media.availability`, IF-15)

**Proposed (KNT-Q3): a medium is a technique.** Writing, a script, paper-making, printing, signal fires, semaphore are
techniques in the same stock, with the same five states, enabling Economy recipes (records as goods) and carried by
Reality's medium properties. `society.available_media` is then derived, not stored: the media whose technique is
deployed in `s`, each with its **user share** (for writing, the literate share `L_s`: holders of the reading skill,
from Cognition's skill port, taught by Society's institutions). No separate media gear; no list of media by period.
Speech and gesture are species capabilities (Life), always available. **(keeper, 2026-11-01)** No separate medium descriptor: a medium technique is marked by `isMedium`; its physical properties are Reality's `world.medium_properties` keyed by the technique id; its user share is the holders of the medium technique over the population (for writing, the people who can read and write the script).

## 2. Interfaces (ports; kernel.json declares each)

| Port (proposed id) | Direction | Owner of the other side | Content | Stub for the demonstration |
|---|---|---|---|---|
| `knowledge.port.holders` | read | Cognition (`mind.belief`, later `mind.skill`) | per mind, via the host handle map: heard of / holds proposition j (`truth` belief, P(true) ≥ θ_hold); skill z ∈ [0,1] for technique k | a fixture list of holders |
| `knowledge.port.deaths` | read | Life (Society later) | deaths and departures by person and society | fixture mortality |
| `knowledge.port.contact` | read | Society (`society.comm_network`) | per pair of communities, per channel: rates `m, c, v, ρ` | a fixed contact matrix |
| `knowledge.port.feasibility` | read | Reality | is recipe r's process physically possible with these materials | fixture booleans |
| `knowledge.port.reach` | read | Economy and Reality | are recipe r's inputs reachable from s | fixture booleans |
| `knowledge.port.records` | read | Economy (`economy.goods.record_object`), Reality (decay) | record objects in s, the item they carry, fidelity, intact or not | fixture records with a decay hazard |
| `knowledge.port.incentive` | read | Economy | cost advantage of k's recipes over the current method, per producer or per society | fixture value |
| `knowledge.port.production` | read | Economy | output by recipe (deployment) | fixture |
| `knowledge.capability` | write | read by Economy, Government, History, adapters | `society.capability_state` | — |
| `knowledge.stock` | write | read by the capability state, History | `society.knowledge_stock` | — |
| `knowledge.media` | write | read by Reality/Cognition communication | `society.available_media` | — |

Imports, one way (ENGINE_MAP): `@rex/kernel` only in code; every engine above is reached through ports, so the package
imports no engine. Society, Catalogue and the communication subsystem do not exist yet; every port the demonstration
needs is a declared stub, flagged as such in each result (§11a: implemented ≠ integrated).

## 3. The first demonstration: KD-1, a technique crossing between two settlements

**Question:** does a technique known in one settlement reach another, or fail to, through media and contact, by
mechanism alone? A two-settlement fixture world on the kernel clock; no game, no dates, no Catalogue read.

**Fixture (fiction, labelled level 6 for its numbers; mechanisms as above):** settlement **A** (population `N_A`) holds
technique **k** (a fixture technique "lime burning": enables a quicklime recipe; propositions *limestone burnt yields
quicklime*, *quicklime with water and sand sets*; tacit share `τ_k` set per case). Settlement **B** (population `N_B`)
does not. Contact matrix, record traffic, B's literacy, B's materials, and the invention switch vary per case; seeds
recorded; each case runs ≥ 200 seeds.

| Case | Set-up | Expected result (the acceptance test) |
|---|---|---|
| KD-1a no contact | all rates 0; invention off | B never knows k; B's states stay false for every seed |
| KD-1b migration | `m_AB > 0`, holders a fraction of A | arrival time in B is exponential with hazard `h_mig` (§1.4); the empirical mean over seeds matches `1/h_mig` within the 95 % interval (verification of the hazard, level 1 maths) |
| KD-1c records only, low tacit share | `ρ_AB > 0`, `L_B > 0`, `τ_k` small (reader's explicit skill `≥ minSkill`), no migration, **invention off** | B becomes **known** and **invented**; never known nor invented if `L_B = 0` |
| KD-1d records only, high tacit share | as KD-1c with `τ_k` large (explicit skill `< minSkill`), **invention off** | B becomes **known** but never **invented** (Collins' TEA laser pattern, qualitative, level 3); with invention on, closing the gap by trial waits on the researched form of `q` (§1.5) |
| KD-1e not possible in B | B has no limestone reachable; migration on | B may become **known** and even hold a migrant who has the method, but never **adopted** or **deployed** (ROADMAP P9 test 1 analogue) |
| KD-1f no incentive | possible, invented, cost advantage ≤ 0 | known and invented, never adopted (the aeolipile pattern) |
| KD-1g adoption speed | possible, invented, advantage > 0; two contact densities, two advantages | adoption follows an S-curve; the time from 10 % to 90 % of `M_B` falls as contact and advantage rise (ROADMAP P9 test 2; Griliches' direction) |
| KD-1h loss before contact | A small, holders few, mortality on, contact late | some seeds: A loses k before B is reached (lost event, cause recorded); if a record survives in A, k is **known, not invented** in A (recoverable); the share of seeds with loss falls as `N_A` grows (Henrich's direction) |
| KD-1i determinism | any case, same seed twice; different seed | byte-identical replay; a different seed differs only in the stochastic draws |

Run at **both resolutions** where the mechanism exists (agent with stubbed Cognition holders; aggregate with the §1
hazards): the mean arrival time and the mean adoption curve agree within a stated tolerance (invariant 3).

## 4. Validation plan (§11a: implemented ≠ integrated ≠ validated)

**Verification (every unit):** hazards against closed forms (exponential arrival, logistic/Bass solution), the
Henrich recursion against its analytic critical size `N*`, conservation (no holder counted in two societies; a record
in one place), the no-tech-tree and no-date fence tests, determinism.

**Integration (only when a port's contract changes):** with Cognition (holder port), Economy (gate and incentive),
Society (contact), each when its side exists; until then the stub is named in every result.

**Validation against independent data (periodic; never the data used to set parameters):**

| Target | Data (independent) | Indicator and tolerance (proposed; set before the run) | Level |
|---|---|---|---|
| toolkit size rises with population and contact | Kline & Boyd 2010, *Proc. R. Soc. B* 277 (10 Oceanic societies) | sign and order of magnitude of the slope of log tool count on log population; held out: Vaesen et al. 2016 hunter-gatherer data, where the expected result is *weak or no* relation; both reported | 2 |
| adoption is S-shaped and faster with profit | Griliches 1957 (hybrid corn by US state); Ryan & Gross 1943, *Rural Sociology* 8 (Iowa farmers) | logistic fit R²; rank correlation of speed with profitability, sign must match | 2 |
| adoption lags between societies | Comin & Hobijn 2010, *American Economic Review* 100 (CHAT, 15 technologies, 166 countries) | distribution of lags at civilisation scale, P11 benchmark only | 2–3 |
| records-only transfer of tacit techniques fails | Collins 1974 | qualitative: KD-1d pattern | 3 |
| records survive at measured rates | Kestemont et al. 2022, *Science* 375 (survival of medieval literature, unseen-species estimates); Buringh 2011 (manuscript production) | record-survival half-lives fed to Reality's decay, then stock loss compared; numbers to be read by a research unit, none quoted here | 2–3 |

Explicit uncertainty is the honest result for the civilisation scale (§11a). A failed validation is investigated for a
missing mechanism, input or interaction, never tuned to pass.

## 5. Questions for Rex: all answered (Rex, 2026-10-31)

- **KNT-Q1.** **(Rex, 2026-10-31) Yes:** "invented" means a working method present here; first development is History's record and the Catalogue's reference. Was: **The five states.** Proposed meanings (§1.1): *possible* = physically feasible with inputs in reach;
  *known* = someone holds the principle or a readable record carries it; *invented* = someone here holds a working
  method that has succeeded here (developed here or brought in); *adopted* = a producer chose to use it; *deployed* =
  the share of output it produces. Is this what you meant by the five, in particular "invented" meaning *a working
  method present here* rather than *first developed here*? (Where it was first developed is History's record and the
  Catalogue's reference, not a state.)
- **KNT-Q2.** **(Rex, 2026-10-31) Yes:** propositions and techniques; no technique names another. Was: **Two kinds of knowledge item.** Proposed: *propositions* (knowing-that) and *techniques* (knowing-how, which
  rest on propositions and carry a skill and a tacit share), after Mokyr's Ω and λ. A technique never names another
  technique (no tree). Approve?
- **KNT-Q3.** **(Rex, 2026-10-31) Yes:** media are techniques in the same stock. Was: **A medium is a technique.** Proposed: writing, paper, printing, signal systems are techniques in the same
  stock; "available media" is derived from their deployment and the literate share; no separate media list. Approve?
- **KNT-Q4.** **(Rex, 2026-10-31) Yes:** Cognition decides at agent resolution, this engine aggregates; the hazard forms must match the agent mean. Was: **Resolution split.** Proposed: at agent resolution, discovery, learning and adoption are Cognition's
  choices and this engine only aggregates them; the hazard forms (§1.2, §1.4–§1.6) are used only at aggregate
  resolution and must match the agent mean. Approve?

## 6. Coordination (open with other keepers)

- **KNT-C1 (Cognition): agreed 2026-10-31**, a read-only view over Cognition's outputs (Cognition records it as its
  §12 C-K3). The holder port reads `mind.belief` as a consumer and never writes. "Holds proposition j" means the mind
  has a categorical `BeliefEntry` about its own handle for j, attribute `truth`, support {true, false}, with
  `P(true) ≥ θ_hold`. `θ_hold` is this engine's parameter (null until researched). Beliefs are keyed by each mind's
  own handles, so the port takes a host handle map from proposition id to each mind's handle (mistaken identity is
  deferred, Cognition C-Q9). The port reports two levels: **heard of** (an entry exists, possibly a false prior) and
  **holds** (`P ≥ θ_hold`); only *holds* counts toward `H_s(j)`. A holder is counted whenever an entry crosses
  `θ_hold`, by whatever route (lived outcome, testimony, reading); the route is Cognition's. A mind discovering a
  proposition from its own experience is Cognition's outcome-learning and attribution (§2.5). **Still open:** a mind
  inventing a *new technique*, a new action, would be Cognition's `decision.generate` compounds; that is not designed,
  so for now the invention route exists only at aggregate resolution (§1.5; KNT-6). Skill will be a per-technique
  scalar on [0,1] per mind (`mind.skill`, proposed, from `cognition.skill.practice`, reserved). `minSkill` uses the
  same scale; the units are Rex's STATS decision and stay open (KNT-7).
- **KNT-K1 (Catalogue): agreed 2026-10-31** (recorded in `catalogue/DESIGN.md` §0). A technology or practice entry
  carries reference dates, origin, names and sources; this engine's technique record carries only `catalogueRef` (the
  full id `catalogue/technology.<slug>` or `catalogue/practice.<slug>`; ids never renamed, aliases on merge).
  Propositions are **not** catalogued: they are knowledge content and have one home, here. Where historians date a
  technique on its own, the Catalogue gives it its own record (`part_of` / `variant_of`), so `catalogueRef` points at
  the finest dated grain. The Catalogue's `documented_prerequisite` relation (a cited "X was made with Y") may be cited
  by the writers of technique records as a source; no mechanism reads it at run time. Game configuration seeds initial
  stocks from Catalogue tags (PLATFORM §6) through an adapter, never a mechanism read. This engine's no-date fence test
  and the Catalogue's V2 check enforce the same rule from both sides.
- **KNT-S1 (Society):** the contact port: rates per pair of communities per channel; apprenticeship as a channel;
  literacy taught by institutions. DUP-60: techniques are content on the one network.
- **KNT-E1 (Economy):** replace `Recipe.knowledge` with a technique id and the gate of §1.3; the cost-advantage port;
  skill-below-minimum penalties stay Economy's.
- **KNT-R1 (Reality):** the feasibility port (manufacturing feasibility, domain A) and record decay by medium.
- **KNT-G1 (registry):** proposed rows `knowledge.capability.state`, `knowledge.technique.requirements`,
  `knowledge.invention.hazard`, `knowledge.adoption.aggregate`; quantity `society.capability_state`; existing rows
  `knowledge.collective.stock`, `knowledge.technology.diffusion`, `knowledge.media.availability` given formulations;
  DUP-60 and DUP-61 owners as proposed there (this design follows them). Full contracts are sent after Rex approves
  the design; the four new ids were announced to the registry keeper on 2026-10-31 after a search, so nobody builds
  them twice.
- **DUP-61 and DUP-60 (Rex approved batch 2b, 2026-10-31; DUP-61 to this engine).** This engine agreed the acceptance
  tests with amendments:
  - DUP-61: (2) is refined. If a readable record survives the last holder, the technique stays *known* and drops out
    of *invented*. A record nobody alive can read does not count until a reader appears. Two tests are added: (4) the
    stock at summary resolution equals the mean of the person-by-person run within a stated tolerance; (5) no
    Cognition process reads `society.knowledge_stock`.
  - DUP-60: diffusion is technique content on Society's network, with the channel content rules of §1.4. Cutting a
    link stops new transmission along it but erases neither a delivered record nor knowledge already held.

## Sources (to be confirmed and expanded by each research unit; no number is taken from them yet)

Allen 2009, *The British Industrial Revolution in Global Perspective*; Bass 1969, *Management Science* 15; Buringh
2011, *Medieval Manuscripts in Latin Europe*; Collins 1974, *Science Studies* 4; Collins 2010, *Tacit and Explicit
Knowledge*; Comin & Hobijn 2010, *American Economic Review* 100; Griliches 1957, *Econometrica* 25; Hägerstrand 1967,
*Innovation Diffusion as a Spatial Process*; Henrich 2004, *American Antiquity* 69; Kestemont et al. 2022, *Science*
375; Kline & Boyd 2010, *Proceedings of the Royal Society B* 277; Mokyr 2002, *The Gifts of Athena*; Polanyi 1966,
*The Tacit Dimension*; Read 2006, *American Antiquity* 71; Rogers 2003, *Diffusion of Innovations* (5th ed.); Ryan &
Gross 1943, *Rural Sociology* 8; Vaesen et al. 2016, *PNAS* 113; Weitzman 1998, *Quarterly Journal of Economics* 113.

## Log

| Date | What |
|---|---|
| 2026-10-31 | Keeper started (controller's brief); design drafted for Rex's approval: capability states, stock with loss, technique knowledge requirements, diffusion channels, aggregate invention and adoption, media as techniques, KD-1 demonstration; KNT-Q1–Q4 open |
| 2026-10-31 | KNT-K1 agreed with the Catalogue keeper: `catalogueRef` takes technology or practice ids; propositions never catalogued; `documented_prerequisite` is a source for writers, never a run-time read |
| 2026-10-31 | KNT-C1 agreed with the Cognition keeper: holder port reads `mind.belief` (`truth` attribute, θ_hold ours, host handle map, heard-of vs holds); individual technique invention open (KNT-6); skill on [0,1], units open (KNT-7) |
| 2026-10-31 | **Approved by Rex**: KNT-Q1–Q4 as proposed; package, hooks, lane and first units follow |
| 2026-10-31 | Rex approved batch 2b: DUP-61 to Knowledge & Technology, DUP-60 one network. This engine agreed both acceptance tests, with the amendments in §6; the four new row ids announced to the registry keeper |
| 2026-11-01 | Keeper rulings on units parked in the lane: records and artefacts carry a technique without a living holder (§1.4); KD-1c and KD-1d run with invention off (§3); medium user share = holders of the medium technique, no descriptor (§1.8); the KD-1a fixture keeps B possible (correct per §1.1). The dependence of adoption speed on the cost advantage and of `q` on `τ` waits on a research unit |
