# Research: adoption speed, Bass parameters, copying loss, invention rate (unit 2989, 2026-11-01)

Scope: research only, no change to DESIGN.md. It feeds DESIGN §1.2 (copying loss), §1.5 (invention hazard `q`),
§1.6 (adoption) and §4 (validation). Read first: DESIGN §1.2, §1.5, §1.6, §4 and its Sources list.

**How to read the labels.** *researched* = a number or statement I read in a page I opened this session (the URL is
given). *secondary* = I read it only in a page that quotes another source; the primary was not opened. *estimate* =
my own reasoning or arithmetic, never a source value. Evidence levels follow the use in DESIGN (PLATFORM §4 itself
was outside this unit's read list, so I use the levels as DESIGN applies them: 1 maths/physics, 2 independent
empirical regularity, 3 historical or case reasoning, 4 mechanism model with some data support, 5 theory without a
fitted form, 6 fiction or unsourced).

**Limits of this pass (stated up front).** Journal full texts for Griliches 1957, Sultan–Farley–Lehmann 1990,
Weitzman 1998, Henrich 2004 and Mahajan–Muller–Bass 1995 were paywalled or came back as unreadable PDF streams. I
read abstracts and secondary descriptions only. Where a coefficient or form is therefore missing, it is listed under
"Not found" in that section, not guessed.

---

## Adoption speed and profitability

**Griliches 1957** (Zvi Griliches, "Hybrid Corn: An Exploration in the Economics of Technological Change",
*Econometrica* 25(4), 501–522; opened abstract page:
https://www.econometricsociety.org/publications/econometrica/1957/10/01/hybrid-corn-exploration-economics-technological-change).

- *Researched (abstract):* logistic growth curves were fitted to hybrid-corn adoption by US state and by crop
  reporting district; each area is reduced to three parameters: **origin, slope, ceiling**. Origins differ with the
  supply-side profitability of entry (lag in developing adaptable hybrids and in seed firms entering; depends on
  market density, innovation cost and marketing cost). **Ceilings and slopes differ with the profitability to farmers
  of switching from open-pollinated to hybrid seed.** (Level 2.)
- *Secondary:* fits had R² of 0.98 or higher (AcaWiki summary, which I could not check against the paper:
  https://acawiki.org/Hybrid_corn:_An_exploration_in_the_economics_of_technological_change). Farmers' profitability
  was measured as yield gain per acre from hybrids minus the seed-cost difference (an eScholarship summary of the
  paper, found via search, not opened; do not rely on it). A 2021 review is said to describe the slope as "well
  explained by the degree of superiority of hybrids" and Mansfield's later work as finding slopes well explained by
  profitability (search-result excerpt of Stokey, "Technology Diffusion", *Review of Economic Dynamics* 42, 15–36;
  I could not open it: https://www.cmegroup.com/company/files/stokey-technology-diffusion-red-2021.pdf).
- **Not found:** the regression coefficients, the functional form linking slope or ceiling to profit (linear, log,
  other), and standard errors. They sit in the paper body, which I could not read. So the *sign* (more profit, higher
  slope and higher ceiling) is level 2; the *shape* is open.

**Re-analysis.** Robert Dixon, "Hybrid Corn Revisited", *Econometrica* 48(6), 1451–1461, Sept 1980 (opened abstract
page: https://www.econometricsociety.org/publications/econometrica/1980/09/01/hybrid-corn-revisited): compares
alternative measures of the rate of diffusion, applies them to US hybrid corn with more recent data and improved
estimation, and assesses how much "profitability" variables explain differences in diffusion rate between states.
Griliches replied in the same issue (pp. 1463–1465; title and pages from a search result). *Not found:* Dixon's
findings (the abstract does not say whether profitability explained more or less). A second-hand note says Dixon
re-estimated the original parameters and a related NBER paper reported consistent results (search-result excerpt,
unverified).

**What this gives the engine.** DESIGN §1.6 says "speed rising with profitability, level 2". That is supported by the
abstract. What §1.6 does not have is any number or any slope function; none was found.

---

## Bass parameters

**Form.** Bass 1969, *Management Science* 15 (not opened; DESIGN's equation is the standard textbook form).

**Published ranges (all *secondary*; primaries not opened).**

| Statement | Value | Where I read it |
|---|---|---|
| Average p (innovation coefficient) | 0.03 | Wikipedia "Bass diffusion model", attributing to Mahajan, Muller & Bass (1995), *Marketing Science*, "Diffusion of new products: Empirical generalizations and managerial uses": https://en.wikipedia.org/wiki/Bass_diffusion_model |
| Typical range of p | 0.01 to 0.03 | same page; a second range, 0.00007 to 0.03, is attributed to a Chandrasekaran & Tellis review in a search excerpt (not opened) |
| Average q (imitation coefficient) | 0.38 | same page |
| Typical range of q | 0.3 to 0.5 (same page); 0.2 to 0.4 (Orbach 2016, *Innovative Marketing*, as quoted on the same page); 0.38 to 0.53 (search excerpt, unverified) | same page |
| p = 0.03, q = 0.38 pooled | attributed here to Sultan, Farley & Lehmann 1990 | search excerpt of a 2015 Venice working paper: https://iris.unive.it/retrieve/handle/10278/3664720/61361/bassCoefficients%20v3%20(29%20mars%202015)%20xArca.pdf (PDF unreadable to me) |

All are for years as the time unit and for **modern marketed products** (durables, pharmaceuticals, agriculture,
industrial technology). Nothing found applies to pre-modern techniques. Level 2 for those products; for a historical
society the numbers are not evidence.

**Sultan, Farley & Lehmann 1990** (*Journal of Marketing Research* 27(1), 70–77; opened Columbia abstract via search:
https://business.columbia.edu/faculty/research/meta-analysis-applications-diffusion-models): meta-analysis of 213
applications from 15 articles that relates the model parameters to the nature of the innovation, the country, model
specification and estimation procedure. *Not found:* the coefficients of that regression (which innovation types
raise p or q, by how much). The abstract page itself reports no averages; the 0.03 and 0.38 above come only from the
secondary pages, and two different primaries (Sultan et al. 1990, Mahajan et al. 1995) are given for the same pair,
so the attribution is uncertain.

**What drives p and q.** *Researched (abstract):* Van den Bulte & Stremersch 2004, "Social contagion and income
heterogeneity in new product diffusion: a meta-analytic test", *Marketing Science* 23(4), 530–544
(https://repub.eur.nl/pub/1012). The ratio **q/p** is higher where income inequality (Gini) is higher, which the
authors read as heterogeneity in adoption thresholds; it varies with the four Hofstede culture dimensions (three in a
pattern consistent with social contagion); and products with competing standards have a higher q/p. Culture effects
appear only for products without competing standards. The page gives no mean p or q. Level 2.
Sultan et al. (abstract): innovation type, country, specification and estimation method matter. A Bass fit's
estimates also depend on the estimation method (the same excerpt), which means a published p or q is partly a
property of how it was fitted, not only of the world.

**Implication for §1.6.** In the engine `q_s` is already "contact density" and `M_s` is the cost-advantage cap. The
literature supports both readings (contagion through contact; thresholds heterogeneity setting who adopts), and no
source gives a p or q for non-market societies.

---

## Copying loss (Henrich alpha and beta)

**Henrich 2004** (Joseph Henrich, "Demography and Cultural Evolution: How Adaptive Cultural Processes Can Produce
Maladaptive Losses — The Tasmanian Case", *American Antiquity* 69(2), 197–214; bibliographic details and abstract
seen at https://www.cambridge.org/core/product/8CD08CC61E6FACF59EC02659B2BDA43C via search; the paper text was not
read).

**A replication of the model, opened** (Acerbi, *Cultural evolution in the digital age*, a teaching text):
https://albertoacerbi.github.io/IBM-cultevo/demography.html. Each learner's new skill is drawn from a Gumbel
distribution with location (best skill in the population − α) and scale σ (the text says σ is sometimes written β).
The critical size N* is where the fitted mean skill change crosses zero against ln N. Values the page uses and
reports:

| α (scale σ = 1) | N* from their regression (researched, tutorial) | exp(α/σ − γ), my arithmetic (estimate) |
|---|---|---|
| 7 ("simple skill") | about 639 (intercept −6.4284, slope 0.9951) | about 616 |
| 9 ("complex skill") | about 4806 | about 4550 |

So DESIGN's N* = exp(α/β − γ) matches the tutorial's setup (intercept ≈ −α + γσ, slope ≈ σ; the 4–6 % gap is
simulation noise or the fit, an inference). The page also reports that N* grows exponentially with α/σ.
**These α and β are illustrative simulation settings, not estimates from data.** No source I opened estimates α or β
for a real technique, and none gives an empirically measured critical population size. (Level 4 for the mechanism,
level 6 for any numbers.)

**Competing results, as stated.**

- **Read 2006** (Dwight Read, "Tasmanian Knowledge and Skill: Maladaptive Imitation or Adequate Technology?",
  *American Antiquity* 71(1), 164–184; opened abstract:
  https://www.cambridge.org/core/journals/american-antiquity/article/tasmanian-knowledge-and-skill-maladaptive-imitation-or-adequate-technology/A5C5DA615941E9A6221C1097B19739F3).
  He argues the skilled-model account fits neither the Tasmanian record nor hunter-gatherer ethnography, that
  Tasmanian tools were adequate for their tasks, and offers a model separating motor skill from task knowledge with
  the time cost of acquiring skill. He ties skill loss to changes in resource procurement or technology, not to a
  shortage of models. Henrich published a reply ("Understanding cultural evolutionary models: a reply to Read's
  critique", *American Antiquity*; title seen in search results, not opened).
- **Kline & Boyd 2010** (*Proceedings of the Royal Society B* 277(1693), 2559–2564): across Oceanic islands near
  European contact, smaller populations had less complicated marine-foraging technology; ten groups; contact rate
  was added to answer earlier continental null results (abstract, via search). A Yale HRAF summary lists the
  multiple-regression p-values from 0.003 to 0.143 across specifications and the contact effect as only marginal
  (p = 0.075 Mann–Whitney, p = 0.052 t-test; secondary: https://hraf.yale.edu/hypotheses/3003 and neighbouring
  entries). Level 2, n = 10.
- **Collard et al.** Two papers. Collard, Kemery & Banks (2005), 20 hunter-gatherer groups: no population effect
  (as described in the 2013 paper). Collard, Ruttle, Buchanan & O'Brien (2013), "Population size and cultural
  evolution in nonindustrial food-producing societies", *PLoS ONE* 8(9) e72628 (opened:
  https://pmc.ncbi.nlm.nih.gov/articles/PMC3772076/): 40 farming and herding groups; population size predicted
  toolkit richness (r² = 0.27, β = 0.52, p = 0.001) and complexity (r² = 0.39, β = 0.63, p < 0.001); in multiple
  regression with rainfall and effective temperature (risk proxies) only population size was significant (r² = 0.30
  and 0.41). They accept both their result and the earlier null and offer three untested reasons for the
  difference: mode of production, information-sharing norms, and a threshold effect (food producers are often far
  larger than the largest hunter-gatherer group, roughly 12,000 people). They state that population size "affects
  cultural richness and complexity in some populations but not in others".
- **Vaesen, Collard, Cosgrove & Roebroeks 2016** (*PNAS* 113(16), E2241–E2247; opened
  https://pmc.ncbi.nlm.nih.gov/articles/PMC4843435): reviewed eight studies; six found no population-size effect once
  other drivers were included, four found complexity tracking environmental risk; they report that Henrich 2004 and
  Powell et al. 2009 fail theoretically and empirically, that the models link population to skill not to complexity,
  that results depend on the assumed transmission mode (e.g. "Best"), and that the one documented Tasmanian loss
  (bone points) was simpler than skills kept. They count Kline & Boyd and Collard et al. as the two consistent
  studies but without control for task specialisation. (The page summary I read gave "45" groups for Collard et al.;
  the 2013 paper has 40, so that count is unreliable.)
- **Experiments.** Derex, Beugin, Godelle & Raymond (2013), *Nature* 503, 389–391: in a computer task larger groups
  kept higher cultural complexity and lost fewer skills (abstract via search; group sizes 2, 4, 8, 16 per a blog
  summary). Muthukrishna & Henrich (2016), "Innovation in the collective brain", *Philosophical Transactions of the
  Royal Society B* (opened https://pmc.ncbi.nlm.nih.gov/articles/PMC4780534): names α (gap between model and mean
  learner) as transmission fidelity and β as variance, states that higher fidelity (lower α) and higher variance
  (higher β) raise mean complexity, and cites three experiments in which skill accumulates with more models. It gives
  no numeric α or β and an optimum of interconnectedness may exist. Andersson & Read disputed the Derex reading
  (a search excerpt).

**Net.** The population–complexity link is contested (Kline & Boyd, Collard 2013, Derex for; Collard 2005, Read,
Vaesen against or conditional). DESIGN already keeps both (§1.2, §4); the evidence argues for running both and for
making the Henrich term switchable. No empirical α, β or N*.

---

## Invention rate

**What exists.**

- **Weitzman 1998** ("Recombinant Growth", *Quarterly Journal of Economics* 113(2), 331–360; abstract opened:
  https://econpapers.repec.org/RePEc:oup:qjecon:v:113:y:1998:i:2:p:331-360.). New ideas arise by recombining
  existing ones, as plant breeders cross varieties; knowledge builds on itself through combinatoric feedback; the
  limit is not generating ideas but "turning an abundance of potential ideas into usable form". *Secondary (search
  excerpts, not opened):* baseline pairs of ideas are matched (m = 2); a success probability function maps resources
  to [0,1]; Tsur & Zemel write the number of new useful ideas as Hπ(sY/H) with H seed ideas, s the share of output
  spent and Y output (from the Journal of Economic Dynamics and Control abstract that I could not open:
  https://www.sciencedirect.com/science/article/abs/pii/S0165188906002259). Level 5: a growth theory, with no fitted
  rate and no per-hour probability.
- **Collective-brain framework** (Muthukrishna & Henrich 2016, URL above): innovation sources are serendipity,
  recombination and incremental improvement; drivers are sociality, fidelity and variance; no rate formula.
  Urban patents and inventors scale super-linearly with city size (Bettencourt et al., as cited there). Level 2–4.
- **Experiments** (Derex et al. 2013; three experiments cited in Muthukrishna & Henrich): more models, more
  recombination and refinement. They measure group-level skill, not a success probability per trial-hour.
- **Tacitness (τ).** Collins 1974 (*Science Studies* 4) and Polanyi 1966 are DESIGN's sources; I did not open them
  this pass. I found no source that puts tacitness into a trial-success probability.

**Not found, said plainly.**

1. No source gives a functional form for a success probability **per trial-hour**.
2. No source gives how that probability varies with the **share of a technique's propositions already known**, other
   than Weitzman's qualitative point that the pool of combinable ideas grows with the stock.
3. No source gives how τ enters. The statement in DESIGN §1.5 that q "falls with τ_k (more tacit = more trial)" is
   the design's own reasoning, level 5, and is not backed by an opened source.
4. No experimental or historical estimate of a per-hour invention probability turned up in this pass.

---

## Proposed forms

Evidence levels as defined at the top. "No constant without a source": every constant below is left as a named free
parameter, to be set by validation against independent data (DESIGN §4), never by this note.

### (a) Adoption speed as a function of cost advantage

- **Form the sources support best:** keep DESIGN §1.6's Bass/logistic. Make the speed term a **monotone increasing
  function of the cost advantage** and make the ceiling `M_s` the share of producers whose advantage is positive.
  Support: Griliches 1957 abstract (slope and ceiling follow farmers' profitability; level 2), and Van den Bulte &
  Stremersch 2004 (heterogeneous thresholds and contagion both matter; level 2).
- **Level:** 2 for "S-shaped, faster and higher when more profitable"; 5 for any particular curve.
- **Still hypothesis:** (i) the shape of speed versus profit (linear, log, saturating): Griliches' coefficients not
  read; (ii) whether speed goes through `q` (contagion), through `p`, or through both; (iii) any value of p or q for a
  pre-modern society: the only published ranges are for modern products (p ≈ 0.01–0.03, q ≈ 0.2–0.5, secondary,
  per year) and should be used, if at all, as a *plausibility bracket* for a test, not as a parameter.
- **Test already in DESIGN §4:** rank correlation of speed with profit, sign must match. That is what the sources
  actually support. A magnitude test needs the Griliches coefficients first (next unit: read the paper, Dixon 1980
  and Griliches' reply from a library copy).

### (b) `q` as a function of the share known (`s`) and of `τ`

- **Form the sources support best:** none directly. The best-supported *structure* is Weitzman: successes come from
  recombining known pieces, so the expected number of candidate combinations rises with the known stock; with the
  baseline pairing (m = 2, secondary) that count scales as the square of the known stock. That gives a candidate
  `q(s, τ) = q0 · s^m · h(τ)` with `m = 2` as the Weitzman baseline, `q(0, τ) = 0`, and `h` decreasing with `h(1) = 0`
  or very small.
- **Level:** 5 (theory without a fitted form); the `h(τ)` factor is level 6 (the design's own reasoning).
- **Still hypothesis:** the exponent (2 is a model baseline from a growth paper, not an estimate for real trials);
  the function `h`; the scale `q0` and its units (success probability per trial-hour); whether `q` saturates; whether
  the pool of combinable pieces should be restricted to neighbours of the technique (the same stock raises the number
  of combinations in unrelated domains, which Weitzman's total count does not separate).
- **Recommendation:** keep §1.5's rule that invention is **off or fixed per case** in the demonstration (KD-1). If
  invention is turned on before a source exists, use the monotone constraints (increasing in `s`, decreasing in `τ`,
  zero when `P_s(k)` is false) with a labelled calibration constant, flag the result "unsourced", and calibrate to
  independent invention counts (§4), not to the hazard's own output.

---

## Citation corrections

Checked against the pages I opened; items not opened are not listed as correct.

| DESIGN Sources entry | Finding |
|---|---|
| Griliches 1957, *Econometrica* 25 | Correct: vol. 25(4), pp. 501–522. |
| Read 2006, *American Antiquity* 71 | Correct: 71(1), 164–184, title "Tasmanian Knowledge and Skill: Maladaptive Imitation or Adequate Technology?". **Content mismatch:** DESIGN §1.2 says Read attributes the changes "to environment and risk". Read's abstract says the tools were adequate and the loss tied to changes in resource procurement or technology; the "environment and risk" wording matches Vaesen et al. 2016 (four of eight studies) and Andersson & Read 2016, not Read 2006. Suggest rewording to "adequate technology and changes in resource procurement". |
| Henrich 2004, *American Antiquity* 69 | Correct: 69(2), 197–214 (abstract seen via search). |
| Kline & Boyd 2010, *Proc. R. Soc. B* 277 | Correct: 277(1693), 2559–2564. |
| Vaesen et al. 2016, *PNAS* 113 | Correct: 113(16), E2241–E2247 (authors Vaesen, Collard, Cosgrove, Roebroeks). |
| Weitzman 1998, *QJE* 113 | Correct: 113(2), 331–360. |
| Bass 1969, Ryan & Gross 1943, Comin & Hobijn 2010, Rogers 2003, Hägerstrand 1967, Mokyr 2002, Allen 2009, Collins 1974/2010, Polanyi 1966, Buringh 2011, Kestemont 2022 | Not opened in this unit; unverified. |
| (missing from the list) | Add if cited: Dixon 1980 (*Econometrica* 48(6), 1451–1461); Sultan, Farley & Lehmann 1990 (*JMR* 27(1), 70–77); Van den Bulte & Stremersch 2004 (*Marketing Science* 23(4), 530–544); Mahajan, Muller & Bass 1995 (*Marketing Science*; the 0.03 / 0.38 averages are attributed to it by one secondary page and to Sultan et al. by another); Collard, Ruttle, Buchanan & O'Brien 2013 (*PLoS ONE* 8(9) e72628) and Collard, Kemery & Banks 2005 (journal not verified); Derex et al. 2013 (*Nature* 503, 389–391); Muthukrishna & Henrich 2016 (*Phil. Trans. R. Soc. B*). |
| §4 table row "Vaesen et al. 2016 hunter-gatherer data" | Vaesen et al. is a review of eight studies and a critique of the models, not a data set of its own; hold-out data would have to be the studies it reviews (Collard 2005 for hunter-gatherers). |

## Next steps this pass could not do

Library access is needed for Griliches 1957 (regression tables), Dixon 1980 and the reply, Sultan et al. 1990 (Tables
of effects on p and q), Mahajan et al. 1995, Weitzman 1998 (the π function), Henrich 2004 (α and β definitions), and
Henrich's 2006 reply to Read.
