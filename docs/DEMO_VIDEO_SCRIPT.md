# THREE-MINUTE DEMO VIDEO SCRIPT
## Project: FinPilot AI — Compliant Advisory Co-pilot for SEBI RIAs
### Track 4 (PS4) — 24-Hour Competition Showcase
**Maximum Target Duration:** 180 seconds (3:00)

---

### [0:00 - 0:25] ACT 1: THE HOOK & THE COMPLIANCE PROBLEM
- **Visual:** Open on FinPilot AI Landing Cockpit. Split screen showing SEBI Regulation 17 text alongside a news clipping on retail F&O losses.
- **Narrator Audio:**
  > "Welcome to FinPilot AI — an evidence-based financial advisory co-pilot built specifically for SEBI-Registered Investment Advisers.
  > Under SEBI Regulation 17, an adviser cannot simply trust a client's aggressive risk appetite or let an AI hallucinate investment advice. If an advisory co-pilot suggests an unsuitable mutual fund or fabricates an expense ratio, the fiduciary liability is real.
  > Let's look at how FinPilot AI solves this through deterministic mathematics, page-level document grounding, and strict suitability guardrails."

---

### [0:25 - 1:05] ACT 2: PROFILING & DETERMINISTIC GOAL PLANNING
- **Visual:** Click "Clients", show the multi-step KYC Wizard. Transition to "Goal Planner". Select "Young Couple" (Age 31, Dual Income, Child Education in 15 Years).
- **Narrator Audio:**
  > "First, client profiling. FinPilot AI strictly separates a client's stated risk tolerance from their objective loss-bearing capacity, tracking net monthly surplus, emergency reserves, and liabilities.
  > In the Goal Planner, we evaluate the Young Couple's 15-year higher education goal for ₹50 Lakhs.
  > Notice the mathematical rigor: FinPilot does not let an LLM guess monthly SIP amounts. It computes the exact ordinary annuity sinking fund contribution in Python — showing ₹10,037 per month at an assumed conservative 10% compounding rate. Every assumption is transparently disclosed."

---

### [1:05 - 1:45] ACT 3: DOCUMENT ASSISTANT (RAG) WITH EXACT PAGE CITATIONS
- **Visual:** Navigate to "AI Document Assistant". Ask: *"What is the exit load structure and principal risks in the Scheme Information Document?"*
- **Narrator Audio:**
  > "Next, our mutual fund document engine. Fiduciary advice requires verifiable proof.
  > When we ask about the scheme's exit load and principal risk factors, FinPilot retrieves the indexed Scheme Information Document using hybrid BM25 search.
  > Look at the response: every factual statement is tied to an exact PDF viewer page citation — here, Page 2 confirms the 1% exit load for redemptions within 12 months, and Page 3 outlines equity volatility risks.
  > If a user asks about unsupported assets like cryptocurrencies, FinPilot explicitly states 'Evidence not found' — zero hallucinations."

---

### [1:45 - 2:30] ACT 4: THE SIX-PERSONA EVALUATION LAB & SUITABILITY ENFORCEMENT
- **Visual:** Navigate to "Suitability Lab". Show all 6 rulebook personas. Click "Run Scenario" on "Aggressive Trader".
- **Narrator Audio:**
  > "Now, the core innovation of PS4: our Six-Persona Evaluation Lab, preconfigured with the exact personas from the official competition rulebook.
  > Let's examine Persona 6 — the Aggressive Trader: age 29, with a history of ₹6.5 Lakh F&O drawdowns, seeking an 85% equity allocation for a near-term 2-year goal.
  > Watch what happens when we execute the scenario:
  > The suitability engine issues an immediate **REJECT** decision with a 33% score.
  > Even though the client requested aggressive equity, our deterministic engine catches three critical violations: duration mismatch under 3 years, financial loss capacity failure, and the speculative derivative guardrail.
  > Most importantly: the LLM layer cannot override this rejection. The co-pilot refuses to produce an executable recommendation until capital protection rules are satisfied."

---

### [2:30 - 3:00] ACT 5: SUMMARY & SUBMISSION WRAP-UP
- **Visual:** Navigate to "Proposal Ledger", displaying the passed and rejected audit records. Finish on the Settings & Reproducibility page.
- **Narrator Audio:**
  > "FinPilot AI provides advisers with a complete audit trail: every client profile, goal calculation, RAG citation, and compliance verdict is logged for inspection.
  > The entire platform runs locally on FastAPI, SQLite, PyMuPDF, and React with 100% reproducible test suites.
  > This is FinPilot AI — bridging generative intelligence with SEBI regulatory integrity. Thank you."

---
*End of Video Script (Total Run Time: ~2 mins 50 secs)*
