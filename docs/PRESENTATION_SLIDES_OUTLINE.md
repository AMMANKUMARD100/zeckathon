# PRESENTATION DECK OUTLINE (MAX 10 SLIDES)
## FinPilot AI — Compliant Co-pilot for SEBI-Registered RIAs
### Track 4 (PS4) — Zetheta Algorithms × IIT Patna TIC Inter-Collegiate Competition

---

### SLIDE 1: TITLE & CORE VALUE PROPOSITION
- **Headline:** FinPilot AI — Evidence-Based Financial Advisory Co-pilot
- **Subtitle:** Solving Compliance, Fiduciary Risk, and Document Hallucination for SEBI RIAs
- **Team Identification:** Track 4 (PS4) | Inter-Collegiate Inter-Club Hackathon
- **Demo Link:** Public Downloadable Video (3 mins max)
- **Key Takeaway:** Financial AI where suitability is mathematically enforced, not prompted.

---

### SLIDE 2: THE PROBLEM IN INDIAN WEALTH ADVISORY
- **The Regulatory Reality:** SEBI (Investment Advisers) Regulations, 2013 Regulation 17 mandates strict suitability assessment based on client horizon and loss capacity.
- **The Retail Crisis:** SEBI's landmark retail study revealed 9 out of 10 individual traders lose capital in F&O.
- **The GenAI Trap:** Generic LLMs hallucinate expense ratios, fabricate scheme returns, and succumb to prompt injection, approving dangerous high-risk products for vulnerable clients.

---

### SLIDE 3: SYSTEM ARCHITECTURE & SEPARATION OF POWERS
- **The Architectural Breakthrough:** Two-tier decoupled architecture:
  1. *Assistive AI Layer:* Natural language document navigation and SID extraction.
  2. *Deterministic Fiduciary Engine:* Zero-compromise Python rule engine that evaluates proposals against Regulation 17 guardrails.
- **Rule of Law:** The LLM cannot alter or override a compliance `REJECT` decision.

---

### SLIDE 4: TWO-TIER CLIENT PROFILING (CAPACITY VS WILLINGNESS)
- **Why Traditional Questionnaires Fail:** Confusing a client's *desire* for high returns with their *ability* to survive a market crash.
- **FinPilot Solution:**
  - Evaluates stated risk tolerance alongside objective balance sheet capacity.
  - Computes monthly disposable surplus, debt obligations, and emergency coverage.
  - Automatically restricts equity exposure when capacity is low, regardless of aggressive self-reporting.

---

### SLIDE 5: DETERMINISTIC FINANCIAL MATHEMATICS
- **Zero Hallucination Math:** Real formulas executed in Python, not estimated by LLM token generation.
- **Ordinary Annuity Sinking Fund:**
  $$PMT = \frac{FV_{rem} \times r}{(1 + r)^n - 1}$$
- **SWP Lifespan Simulation:** Simulating monthly withdrawals for senior citizens over 25-year horizons with inflation adjustments and sequence-of-returns protection.

---

### SLIDE 6: GROUNDED RAG WITH EXACT PAGE CITATIONS
- **Grounded Verification:** Extracts from verified Scheme Information Documents (SIDs) and factsheets using PyMuPDF.
- **Exact Viewer Page Citations:** Citations link directly to the 1-based PDF viewer page where the exit load, TER, or riskometer is defined.
- **Explicit Negative Fallback:** If information is absent from the indexed documents, the engine states "Evidence not found" rather than hallucinating answers.

---

### SLIDE 7: THE SIX-PERSONA EVALUATION LAB
- **Built-in Rulebook Benchmark Matrix:**
  1. *Fresh Graduate (23 yrs):* Enforces liquid emergency buffer before equity.
  2. *Young Couple (31 yrs):* 15-year horizon enables balanced equity compounding.
  3. *Small Business (44 yrs):* Flags irregular cashflow, mandating 9-12 month reserve.
  4. *Doctor - Patna (38 yrs):* Rejects equity for short-term parent healthcare needs.
  5. *Retiree - Chennai (68 yrs):* Safeguards ₹80L corpus via debt-heavy SWP strategy.
  6. *Aggressive Trader (29 yrs):* Detects ₹6.5L F&O losses; blocks speculative ask.

---

### SLIDE 8: DEEP DIVE: AGGRESSIVE TRADER SUITABILITY ENFORCEMENT
- **The Scenario:** 29-year-old trader with severe F&O drawdown history requests an 85% equity allocation for a 2-year horizon.
- **Compliance Engine Response:** **MANDATORY REJECTION**
  - Horizon mismatch (< 3 years).
  - Financial loss capacity violation.
  - Derivative speculation guardrail triggered.
- **Outcome:** The system prevents the trade and outputs an actionable capital rehabilitation pathway.

---

### SLIDE 9: REPRODUCIBILITY & SECURITY STANDARDS
- **Universal Rule Compliance:**
  - 100% reproducible via single command test scripts.
  - Clean separation of public data sources.
  - Zero hardcoded API keys; seamless local offline fallback.
  - SQLite local database storing profiles, goals, and proposal audit trails.

---

### SLIDE 10: CONCLUSION & FUTURE HORIZONS
- **Summary:** FinPilot AI bridges the gap between modern generative AI assistance and SEBI fiduciary compliance.
- **Scalability Path:** Integration with MF Central APIs, automated portfolio rebalancing alerts, and account aggregator (AA) cashflow verification.
- **Repository:** Transferred to `ZethetaIntern` with reproducible instructions in README.md.
