# PROJECT DOCUMENT OUTLINE (MAX 8 PAGES)
## PS4: AI-Powered Advisory — Compliant Co-pilot for SEBI-Registered RIA
### Zetheta Algorithms × IIT Patna Trading & Investment Club 24-Hour Hackathon

---

### PAGE 1: TITLE, EXECUTIVE SUMMARY & DEMO LINK
- **Project Title:** FinPilot AI — Evidence-Based Financial Advisory Co-pilot for SEBI RIAs
- **Track:** Track 4 (Problem Statement 4)
- **Mandatory Demo Video Link (Max 3 Mins):** `https://github.com/ZethetaIntern/finpilot-ai/releases/demo.mp4` (Downloadable & Public)
- **Team Mapping & Submission Metadata:**
  - Team Registered Email: [Designated Team Email]
  - Origin GitHub User ID: [Team Origin ID]
  - Repository Transferred to: `ZethetaIntern`
- **Executive Abstract:**
  FinPilot AI is a production-grade algorithmic co-pilot for SEBI Registered Investment Advisers (RIAs). It combines deterministic financial math (ordinary annuity sinking fund formulas), hybrid BM25 lexical-semantic document retrieval over Scheme Information Documents (SIDs), and an unbypassable SEBI Regulation 17 suitability compliance engine that enforces loss-capacity ceilings, duration alignment, and retail speculative guardrails.

---

### PAGE 2: REGULATORY CONTEXT & ARCHITECTURAL FOUNDATIONS
- **SEBI (Investment Advisers) Regulations, 2013 Focus:**
  - *Regulation 17(1)(a):* Mandatory KYC & full financial capacity discovery.
  - *Regulation 17(1)(b):* Assessment of capacity to absorb financial losses (distinguishing psychological risk appetite from real balance sheet capacity).
  - *Regulation 17(1)(c):* Objective basis and time-horizon suitability.
  - *Regulation 17(1)(d):* Capital protection for vulnerable profiles & senior citizens.
- **Fiduciary Architecture Pattern:**
  - The LLM acts purely as an assistive synthesizer and document navigator.
  - An independent deterministic rule engine executes before any proposal is displayed or marked suitable.
  - Architectural decoupling guarantees that LLM prompt manipulation can never override a compliance `REJECT` decision.

---

### PAGE 3: CLIENT PROFILING & CAPACITY EVALUATION ENGINE
- **Two-Tier Risk Discovery Model:**
  - *Psychological Willingness:* Stated risk tolerance (Conservative, Moderate, Aggressive).
  - *Objective Loss-Bearing Capacity:* Monthly net surplus, emergency buffer coverage, existing debt liabilities, and dependency burden.
- **Cashflow Strain & Emergency Reserve Formulas:**
  - Salaried Profiles: Minimum 3–6 months essential expense buffer.
  - Irregular / Business Profiles: Mandatory 9–12 months buffer to prevent emergency equity liquidation.
- **Validation Pipeline:**
  - Missing field detection triggers structured `INSUFFICIENT_DATA` response, blocking recommendation until KYC completeness is attained.

---

### PAGE 4: GOAL-BASED PORTFOLIO MATHEMATICS
- **Time-Value-of-Money (TVM) Formulation:**
  - Future Value of Existing Assets: $FV_{lump} = PV \times (1 + r)^n$
  - Net Sinking Fund Shortfall: $FV_{rem} = Target - FV_{lump}$
  - Ordinary Annuity Monthly Contribution ($r > 0$):
    $$PMT = \frac{FV_{rem} \times r}{(1 + r)^n - 1}$$
    where $r = \frac{\text{Annual Rate}}{12}$ and $n = \text{Years} \times 12$.
  - Explicit Zero-Rate ($r = 0$) Fallback: $PMT = \frac{FV_{rem}}{n}$.
- **Retirement Systematic Withdrawal Plan (SWP) Simulation:**
  - Discrete monthly balance simulation accounting for corpus accrual, inflation-indexed withdrawals, and ruin probabilities over 25+ years.

---

### PAGE 5: RAG PIPELINE & PAGE-LEVEL CITATION VERIFICATION
- **Document Ingestion Pipeline:**
  - PyMuPDF native extraction retaining 1-based PDF viewer page numbers, document titles, and section headings.
  - Paragraph-boundary preserving chunking (no mid-sentence splits).
- **Hybrid Semantic-Lexical Index:**
  - Fast, zero-dependency BM25 scoring with token length normalization.
  - Dynamic score thresholding: Queries yielding similarity below threshold trigger an explicit "Evidence not found in indexed documents" response, preventing hallucinated expense ratios or returns.
- **Citation Model:**
  - Returns document name, exact page index, and verbatim snippet for every factual claim.

---

### PAGE 6: SIX-PERSONA EVALUATION LAB RESULTS
Empirical benchmark results across the 6 rulebook personas:
1. **Fresh Graduate (Age 23, ₹55k/mo):** Emergency fund prioritised in liquid funds; sub-1-year equity requests rejected.
2. **Young Couple (Age 31, Dual Income, Home Loan, 15-Yr Child Edu):** PASS. 15-year horizon justifies 65% diversified equity growth.
3. **Small Business (Age 44, Irregular Cashflow, 14-Yr Retirement):** PASS with advisory warnings enforcing a 9-month liquid buffer.
4. **Doctor - Patna (Age 38, High Income, Risk-Averse, 2-Yr Parent Healthcare):** REJECT on healthcare equity ask; liquid preservation mandated.
5. **Retiree - Chennai (Age 68, ₹80L Corpus, 25-Yr SWP):** FLAG. Equity strictly capped at 20% to avoid sequence-of-returns drawdown risk.
6. **Aggressive Trader (Age 29, ₹6.5L F&O Loss History):** REJECT. Speculative high-beta allocation blocked; risk repair mandated.

---

### PAGE 7: SYSTEM ARCHITECTURE & DATA FLOW
- **Mermaid Architecture Diagram:**
  - React/TypeScript Frontend $\to$ FastAPI REST Endpoints $\to$ Pydantic Validation $\to$ SQLite ORM.
  - Independent RAG Retriever $\leftrightarrow$ PyMuPDF Page Index.
  - Deterministic Python Suitability Engine $\leftrightarrow$ SEBI Regulation 17 Rule Registry.
- **Security & Privacy Measures:**
  - Zero PII exposure in public endpoints.
  - Local database storage and untrusted document isolation.

---

### PAGE 8: STATUTORY DISCLAIMERS & SUBMISSION CHECKLIST
- **Statutory Prototype Disclaimers:**
  - Educational/competition prototype for Zecathon. Does not represent SEBI certification or direct financial advice.
- **Verification Checklist:**
  - [x] Searchable, selectable text in report PDF.
  - [x] File size under 20 MB ceiling.
  - [x] Public GitHub repo transferred to `ZethetaIntern`.
  - [x] Downloadable 3-minute demo video link on Page 1 and README.
  - [x] Public datasets and AI tool declarations documented.
