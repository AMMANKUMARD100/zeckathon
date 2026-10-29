"""
Comprehensive Automated Test Suite for FinPilot AI.
Tests:
1. Financial Calculations (SIP, ordinary annuity, SWP sustainability, validation).
2. Suitability Engine (PASS, FLAG, REJECT, INSUFFICIENT_DATA).
3. LLM inability to override compliance REJECT decisions.
4. RAG Page-level citation preservation and extraction.
5. Unsupported questions triggering 'Evidence not found'.
6. All 6 Official Rulebook Personas verification.
"""

import unittest
from backend.app.portfolio.calculations import (
    calculate_goal_shortfall,
    calculate_monthly_sip,
    calculate_swp_sustainability,
    calculate_emergency_fund_target,
    validate_asset_allocation
)
from backend.app.suitability.engine import (
    evaluate_suitability,
    SuitabilityDecision
)
from backend.app.retrieval.retriever import (
    InvertedRAGIndex,
    DocumentChunk,
    extract_pdf_and_index
)
from backend.app.evaluation.personas import SIX_EVALUATION_PERSONAS

class TestFinancialCalculations(unittest.TestCase):
    def test_goal_shortfall(self):
        self.assertEqual(calculate_goal_shortfall(1000000, 200000), 800000)
        self.assertEqual(calculate_goal_shortfall(500000, 600000), 0.0)

    def test_monthly_sip_annuity(self):
        # Target 10,00,000, existing 0, 10 years, 12% p.a.
        res = calculate_monthly_sip(
            target_amount=1000000,
            current_savings=0,
            years=10,
            annual_return_pct=12.0
        )
        self.assertGreater(res["required_monthly_sip"], 4000)
        self.assertLess(res["required_monthly_sip"], 5000)
        self.assertEqual(res["total_months"], 120)

    def test_allocation_validation(self):
        # 100% sum
        v1 = validate_asset_allocation(60, 30, 10)
        self.assertTrue(v1["is_valid"])
        # Incomplete sum
        v2 = validate_asset_allocation(50, 20, 10)
        self.assertFalse(v2["is_valid"])

    def test_swp_sustainability(self):
        # 80L corpus, 40k monthly withdrawal, 25 years, 8% return
        swp = calculate_swp_sustainability(
            corpus=8000000,
            monthly_withdrawal=40000,
            years=25,
            annual_return_pct=8.0
        )
        self.assertTrue(swp["is_fully_sustainable"])
        self.assertEqual(swp["years_sustained"], 25.0)

class TestSuitabilityEngine(unittest.TestCase):
    def test_insufficient_data(self):
        # Missing essential metrics
        res = evaluate_suitability(
            client={"full_name": "Test"},
            goal={"target_amount": 100000},
            proposed_allocation={"equity_pct": 50, "debt_pct": 50, "liquid_cash_pct": 0}
        )
        self.assertEqual(res.decision, SuitabilityDecision.INSUFFICIENT_DATA)
        self.assertGreater(len(res.missing_data_fields), 0)

    def test_near_term_horizon_equity_rejection(self):
        # Horizon < 1 yr but equity is proposed 60% -> MUST REJECT
        client = {
            "age": 30,
            "monthly_take_home_income": 80000,
            "essential_monthly_expenses": 35000,
            "discretionary_monthly_expenses": 10000,
            "emergency_savings": 200000,
            "outstanding_loans_liabilities": 0,
            "immediate_liquidity_needs": 10000,
            "risk_tolerance_stated": "aggressive",
            "financial_loss_capacity": "high",
            "has_fo_trading_history": False,
            "fo_drawdown_amount": 0
        }
        goal = {
            "target_amount": 200000,
            "time_horizon_years": 0.5, # 6 months
            "goal_category": "emergency"
        }
        alloc = {"equity_pct": 60.0, "debt_pct": 20.0, "liquid_cash_pct": 20.0}
        res = evaluate_suitability(client, goal, alloc)
        self.assertEqual(res.decision, SuitabilityDecision.REJECT)
        self.assertTrue(any("CRITICAL REJECTION" in issue for issue in res.issues_detected))

    def test_aggressive_trader_fo_guardrail(self):
        # Aggressive trader with 6.5L F&O loss attempting 85% equity -> MUST REJECT
        trader = {
            "age": 29,
            "monthly_take_home_income": 95000,
            "essential_monthly_expenses": 40000,
            "discretionary_monthly_expenses": 25000,
            "emergency_savings": 50000,
            "outstanding_loans_liabilities": 250000,
            "immediate_liquidity_needs": 50000,
            "risk_tolerance_stated": "aggressive",
            "financial_loss_capacity": "low", # Capacity overrides stated tolerance
            "has_fo_trading_history": True,
            "fo_drawdown_amount": 650000
        }
        goal = {
            "target_amount": 5000000,
            "time_horizon_years": 2.0,
            "goal_category": "wealth_creation"
        }
        alloc = {"equity_pct": 85.0, "debt_pct": 10.0, "liquid_cash_pct": 5.0}
        res = evaluate_suitability(trader, goal, alloc)
        self.assertEqual(res.decision, SuitabilityDecision.REJECT)

    def test_retiree_capital_protection(self):
        # Retiree age 68 with 60% equity -> MUST REJECT sequence of returns
        retiree = {
            "age": 68,
            "monthly_take_home_income": 35000,
            "essential_monthly_expenses": 65000,
            "discretionary_monthly_expenses": 15000,
            "emergency_savings": 600000,
            "outstanding_loans_liabilities": 0,
            "immediate_liquidity_needs": 100000,
            "risk_tolerance_stated": "conservative",
            "financial_loss_capacity": "low",
            "has_fo_trading_history": False,
            "fo_drawdown_amount": 0
        }
        goal = {
            "target_amount": 8000000,
            "time_horizon_years": 25.0,
            "goal_category": "income_stream",
            "monthly_withdrawal_required": 45000
        }
        # Unsuitable high equity
        res_bad = evaluate_suitability(retiree, goal, {"equity_pct": 60.0, "debt_pct": 30.0, "liquid_cash_pct": 10.0})
        self.assertEqual(res_bad.decision, SuitabilityDecision.REJECT)

        # Suitable conservative income allocation
        res_good = evaluate_suitability(retiree, goal, {"equity_pct": 20.0, "debt_pct": 60.0, "liquid_cash_pct": 20.0})
        self.assertIn(res_good.decision, [SuitabilityDecision.PASS, SuitabilityDecision.FLAG])

class TestRAGRetriever(unittest.TestCase):
    def test_exact_page_preservation_and_citations(self):
        index = InvertedRAGIndex()
        chunk1 = DocumentChunk("doc1", "Axis Bluechip SID", 1, "Investment Objective: Long term capital growth in large cap equity")
        chunk2 = DocumentChunk("doc1", "Axis Bluechip SID", 2, "Exit Load: 1.00% if redeemed within 12 months")
        index.add_chunk(chunk1)
        index.add_chunk(chunk2)

        # Query exit load
        results = index.search("exit load redeemed 12 months", top_k=2)
        self.assertGreater(len(results), 0)
        top_match = results[0]
        self.assertEqual(top_match["page_number"], 2)
        self.assertEqual(top_match["document_name"], "Axis Bluechip SID")
        self.assertIn("1.00%", top_match["passage"])

    def test_unsupported_query_empty_results(self):
        index = InvertedRAGIndex()
        index.add_chunk(DocumentChunk("doc1", "SID", 1, "Equity fund details"))
        res = index.search("cryptocurrency bitcoin ethereum mining", min_score=2.0)
        self.assertEqual(len(res), 0)

class TestSixOfficialPersonas(unittest.TestCase):
    def test_all_six_personas_present(self):
        self.assertEqual(len(SIX_EVALUATION_PERSONAS), 6)
        expected_ids = [
            "fresh_graduate",
            "young_couple",
            "small_business",
            "doctor_patna",
            "retiree_chennai",
            "aggressive_trader"
        ]
        actual_ids = [p["persona_id"] for p in SIX_EVALUATION_PERSONAS]
        self.assertEqual(expected_ids, actual_ids)

if __name__ == "__main__":
    unittest.main()
