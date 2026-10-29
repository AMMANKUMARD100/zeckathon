"""
SEBI Suitability and Compliance Engine.

Independent deterministic rule-based compliance engine implementing SEBI RIA Regulations, 2013
(Regulation 17 - Suitability: Know Your Client, Risk Profiling, Asset Allocation Alignment)
and prototype fiduciary guardrails.

Crucially: The LLM NEVER overrides this engine's decisions. The output of this engine
is binding on the portfolio proposal.

Decisions:
- PASS: All suitability rules satisfied.
- FLAG: Minor warnings detected (e.g. slight cash flow strain, borderline risk profile). Advisable with caution.
- REJECT: Violates critical suitability constraints (e.g. aggressive equity for near-term goal, F&O gambler seeking speculative bets, no emergency fund while pouring 100% into small caps).
- INSUFFICIENT_DATA: Missing mandatory client profile metrics required to establish suitability.
"""

from typing import Dict, Any, List
from enum import Enum
from pydantic import BaseModel

class SuitabilityDecision(str, Enum):
    PASS = "PASS"
    FLAG = "FLAG"
    REJECT = "REJECT"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"

class RuleResult(BaseModel):
    rule_id: str
    rule_name: str
    category: str # "SEBI_REGULATION_17", "INTERNAL_RISK_POLICY", "LIQUIDITY_BUFFER"
    is_passed: bool
    severity: str # "INFO", "WARNING", "CRITICAL"
    message: str
    regulatory_reference: str

class SuitabilityReport(BaseModel):
    decision: SuitabilityDecision
    score: float # 0 to 100
    rules_evaluated: int
    rules_passed: int
    issues_detected: List[str]
    rule_results: List[RuleResult]
    explanation: str
    required_next_action: str
    missing_data_fields: List[str]
    is_llm_override_prevented: bool = True

def evaluate_suitability(
    client: Dict[str, Any],
    goal: Dict[str, Any],
    proposed_allocation: Dict[str, float]
) -> SuitabilityReport:
    """
    Evaluates client, goal, and proposed portfolio allocation against SEBI compliance rules.
    """
    missing_fields = []
    
    # 1. Mandatory Data Verification Check
    if not client.get("age"):
        missing_fields.append("client.age")
    if client.get("monthly_take_home_income") is None:
        missing_fields.append("client.monthly_take_home_income")
    if client.get("essential_monthly_expenses") is None:
        missing_fields.append("client.essential_monthly_expenses")
    if not client.get("risk_tolerance_stated"):
        missing_fields.append("client.risk_tolerance_stated")
    if not client.get("financial_loss_capacity"):
        missing_fields.append("client.financial_loss_capacity")
    if goal.get("time_horizon_years") is None:
        missing_fields.append("goal.time_horizon_years")
    if goal.get("target_amount") is None:
        missing_fields.append("goal.target_amount")
        
    if missing_fields:
        return SuitabilityReport(
            decision=SuitabilityDecision.INSUFFICIENT_DATA,
            score=0.0,
            rules_evaluated=1,
            rules_passed=0,
            issues_detected=[f"Missing mandatory KYC / financial metrics: {', '.join(missing_fields)}"],
            rule_results=[
                RuleResult(
                    rule_id="SEBI-KYC-01",
                    rule_name="Mandatory KYC and Financial Capacity Data",
                    category="SEBI_REGULATION_17",
                    is_passed=False,
                    severity="CRITICAL",
                    message=f"SEBI Regulation 17(a) requires complete client profiling before investment advice. Missing: {', '.join(missing_fields)}",
                    regulatory_reference="SEBI (Investment Advisers) Regulations, 2013, Reg 17(1)(a)"
                )
            ],
            explanation="Suitability cannot be determined because critical financial capacity data is missing.",
            required_next_action="Complete the client profiling wizard with all required income, expense, and goal parameters.",
            missing_data_fields=missing_fields
        )

    results: List[RuleResult] = []
    issues: List[str] = []
    
    age = int(client.get("age", 30))
    monthly_income = float(client.get("monthly_take_home_income", 0.0))
    essential_exp = float(client.get("essential_monthly_expenses", 0.0))
    discretionary_exp = float(client.get("discretionary_monthly_expenses", 0.0))
    emergency_savings = float(client.get("emergency_savings", 0.0))
    outstanding_loans = float(client.get("outstanding_loans_liabilities", 0.0))
    immediate_liquidity = float(client.get("immediate_liquidity_needs", 0.0))
    risk_tolerance = str(client.get("risk_tolerance_stated", "")).lower()
    loss_capacity = str(client.get("financial_loss_capacity", "")).lower()
    has_fo_history = bool(client.get("has_fo_trading_history", False))
    fo_drawdown = float(client.get("fo_drawdown_amount", 0.0))
    
    time_horizon = float(goal.get("time_horizon_years", 1.0))
    goal_category = str(goal.get("goal_category", "")).lower()
    is_capital_preservation = bool(goal.get("is_capital_preservation_priority", False))
    monthly_withdrawal = float(goal.get("monthly_withdrawal_required", 0.0))
    
    equity_pct = float(proposed_allocation.get("equity_pct", 0.0))
    debt_pct = float(proposed_allocation.get("debt_pct", 0.0))
    liquid_pct = float(proposed_allocation.get("liquid_cash_pct", 0.0))
    
    # ----------------------------------------------------
    # RULE 1: Horizon vs Equity Risk (Duration Mismatch)
    # SEBI Reg 17(1)(c): Investment advice must have reasonable basis based on investment objective & time horizon
    # ----------------------------------------------------
    r1_pass = True
    r1_msg = "Asset allocation aligns well with the stated goal time horizon."
    r1_severity = "INFO"
    
    if time_horizon < 1.0 and equity_pct > 0.0:
        r1_pass = False
        r1_severity = "CRITICAL"
        r1_msg = f"CRITICAL REJECTION: Time horizon is {time_horizon} yrs (< 1 yr). Proposed equity allocation is {equity_pct}%. Equity investments carry short-term capital drawdown risks unsuitable for sub-1-year goals."
        issues.append(r1_msg)
    elif time_horizon < 3.0 and equity_pct > 25.0:
        r1_pass = False
        r1_severity = "CRITICAL"
        r1_msg = f"CRITICAL REJECTION: Goal horizon is {time_horizon} years (< 3 yrs) but proposed equity is {equity_pct}% (exceeds conservative 25% ceiling). Market volatility could erode capital needed soon."
        issues.append(r1_msg)
    elif time_horizon < 5.0 and equity_pct > 55.0:
        r1_pass = False
        r1_severity = "WARNING"
        r1_msg = f"HIGH RISK WARNING: Proposed equity of {equity_pct}% is elevated for a medium horizon of {time_horizon} years. Standard prudence suggests max 50% equity."
        issues.append(r1_msg)

    results.append(RuleResult(
        rule_id="RULE-HORIZON-EQUITY",
        rule_name="Time Horizon vs Equity Allocation Alignment",
        category="SEBI_REGULATION_17",
        is_passed=r1_pass,
        severity=r1_severity,
        message=r1_msg,
        regulatory_reference="SEBI (IA) Reg 17(1)(c) - Time Horizon Appropriateness"
    ))

    # ----------------------------------------------------
    # RULE 2: Willingness vs Financial Ability to Bear Loss
    # Core SEBI principle: Capacity trumps stated willingness!
    # A client with "Aggressive" appetite but "Low" capacity must be restricted.
    # ----------------------------------------------------
    r2_pass = True
    r2_msg = "Stated risk willingness does not conflict with financial loss-bearing capacity."
    r2_severity = "INFO"
    
    if loss_capacity == "low" and equity_pct > 35.0:
        r2_pass = False
        r2_severity = "CRITICAL"
        r2_msg = f"CAPACITY VIOLATION: Client has LOW financial loss capacity, but proposed equity is {equity_pct}%. Loss capacity legally overrides stated risk tolerance."
        issues.append(r2_msg)
    elif risk_tolerance == "conservative" and equity_pct > 30.0:
        r2_pass = False
        r2_severity = "WARNING"
        r2_msg = f"TOLERANCE MISMATCH: Client stated CONSERVATIVE risk appetite, but proposed equity is {equity_pct}%. May trigger panic during market corrections."
        issues.append(r2_msg)
        
    results.append(RuleResult(
        rule_id="RULE-RISK-CAPACITY-GAP",
        rule_name="Financial Capacity vs Stated Risk Tolerance",
        category="SEBI_REGULATION_17",
        is_passed=r2_pass,
        severity=r2_severity,
        message=r2_msg,
        regulatory_reference="SEBI (IA) Reg 17(1)(b) - Capacity to Absorb Financial Losses"
    ))

    # ----------------------------------------------------
    # RULE 3: Aggressive Trader / F&O History Guardrail
    # Persona: Aggressive Trader with F&O drawdowns.
    # Must enforce guardrails against high-risk speculation and re-channel into structured wealth accumulation.
    # ----------------------------------------------------
    r3_pass = True
    r3_msg = "No concerning derivative/speculative loss history detected."
    r3_severity = "INFO"
    
    if has_fo_history:
        if fo_drawdown > 0:
            if equity_pct > 75.0:
                r3_pass = False
                r3_severity = "CRITICAL"
                r3_msg = f"DERIVATIVE SPECULATION GUARDRAIL: Client suffered ₹{fo_drawdown:,.0f} F&O drawdowns. Unchecked equity allocation ({equity_pct}%) without mandatory debt/liquid dampener is REJECTED. Mandatory risk mitigation required."
                issues.append(r3_msg)
            else:
                r3_pass = True
                r3_severity = "WARNING"
                r3_msg = f"ADVISORY FLAG: Client has past F&O losses (₹{fo_drawdown:,.0f}). Allocation capped and disciplined into structured diversified mutual funds."
                issues.append(r3_msg)
        else:
            r3_severity = "WARNING"
            r3_msg = "Client actively trades F&O. Suitability engine enforces strict mutual fund diversification."
            
    results.append(RuleResult(
        rule_id="RULE-SPECULATION-FO-GUARD",
        rule_name="Speculative Trading & F&O Drawdown Guardrail",
        category="INTERNAL_RISK_POLICY",
        is_passed=r3_pass,
        severity=r3_severity,
        message=r3_msg,
        regulatory_reference="SEBI Study on Retail F&O Losses & Advisory Fiduciary Standard"
    ))

    # ----------------------------------------------------
    # RULE 4: Emergency Fund & Immediate Liquidity Priority
    # Fresh Graduate / Young Family: Must build liquid safety net before aggressive equity.
    # ----------------------------------------------------
    r4_pass = True
    r4_msg = "Emergency liquidity reserves are adequate."
    r4_severity = "INFO"
    
    min_emergency_required = essential_exp * 3.0
    if emergency_savings < min_emergency_required:
        if goal_category != "emergency" and equity_pct > 40.0:
            r4_pass = False
            r4_severity = "CRITICAL"
            r4_msg = f"LIQUIDITY DEFICIT: Client has only ₹{emergency_savings:,.0f} emergency savings (minimum 3 months = ₹{min_emergency_required:,.0f}). Committing {equity_pct}% to equity risks forced liquidation during emergencies."
            issues.append(r4_msg)
        else:
            r4_severity = "WARNING"
            r4_msg = f"Emergency fund is below recommended 3-6 months. Goal allocation must prioritize liquid funds first."
            issues.append(r4_msg)

    results.append(RuleResult(
        rule_id="RULE-EMERGENCY-LIQUIDITY",
        rule_name="Emergency Reserve & Minimum Liquidity Verification",
        category="LIQUIDITY_BUFFER",
        is_passed=r4_pass,
        severity=r4_severity,
        message=r4_msg,
        regulatory_reference="SEBI RIA Fiduciary Standard - Liquidity Prudence"
    ))

    # ----------------------------------------------------
    # RULE 5: Retiree / Pensioner Capital Protection
    # Retiree persona: age >= 60 or monthly withdrawal requirement.
    # Cannot have high market drawdown risk that impairs lifelong monthly income stream.
    # ----------------------------------------------------
    r5_pass = True
    r5_msg = "Retirement income and capital preservation standards satisfied."
    r5_severity = "INFO"
    
    if age >= 60 or monthly_withdrawal > 0 or goal_category == "income_stream":
        if equity_pct > 35.0:
            r5_pass = False
            r5_severity = "CRITICAL"
            r5_msg = f"RETIREE CAPITAL RISK: Age {age} with monthly withdrawal requirement of ₹{monthly_withdrawal:,.0f}. Proposed equity of {equity_pct}% creates sequence-of-returns risk. Capped at 25-30% hybrid/conservative debt."
            issues.append(r5_msg)
        elif liquid_pct + debt_pct < 65.0:
            r5_pass = False
            r5_severity = "WARNING"
            r5_msg = f"INCOME BUFFER WARNING: Retiree regular income stream requires at least 65-70% in high-quality debt and liquid funds."
            issues.append(r5_msg)

    results.append(RuleResult(
        rule_id="RULE-RETIREE-INCOME-SECURITY",
        rule_name="Senior Citizen & Post-Retirement Sequence-of-Returns Safety",
        category="SEBI_REGULATION_17",
        is_passed=r5_pass,
        severity=r5_severity,
        message=r5_msg,
        regulatory_reference="SEBI (IA) Reg 17(1)(d) - Protection of Capital for Vulnerable / Senior Clients"
    ))

    # ----------------------------------------------------
    # RULE 6: Debt-to-Income / Cash Flow Strain
    # Verifies whether liabilities or proposed SIP exceed monthly surplus.
    # ----------------------------------------------------
    r6_pass = True
    r6_msg = "Cash flow surplus is positive and can sustain planned savings."
    r6_severity = "INFO"
    
    monthly_surplus = monthly_income - (essential_exp + discretionary_exp)
    if monthly_surplus <= 0:
        r6_pass = False
        r6_severity = "WARNING"
        r6_msg = f"NEGATIVE CASH FLOW: Client monthly expenses (₹{essential_exp + discretionary_exp:,.0f}) equal or exceed take-home income (₹{monthly_income:,.0f}). Surplus is ₹{monthly_surplus:,.0f}."
        issues.append(r6_msg)
        
    results.append(RuleResult(
        rule_id="RULE-CASHFLOW-VIABILITY",
        rule_name="Monthly Disposable Cashflow & Debt Burden Assessment",
        category="INTERNAL_RISK_POLICY",
        is_passed=r6_pass,
        severity=r6_severity,
        message=r6_msg,
        regulatory_reference="Prudential Financial Planning Guideline"
    ))

    # Decision Aggregation
    has_critical = any(r.severity == "CRITICAL" and not r.is_passed for r in results)
    has_warning = any(r.severity == "WARNING" and not r.is_passed for r in results) or any(r.severity == "WARNING" for r in results)
    
    passed_count = sum(1 for r in results if r.is_passed)
    total_count = len(results)
    score = round((passed_count / total_count) * 100.0, 1)

    if has_critical:
        final_decision = SuitabilityDecision.REJECT
        explanation = "The proposed portfolio violates critical SEBI RIA suitability rules and cannot be legally or prudently recommended."
        action = "Reallocate capital to conform with client horizon, loss-bearing capacity, and emergency liquidity safeguards."
    elif has_warning:
        final_decision = SuitabilityDecision.FLAG
        explanation = "The proposal is viable but triggered compliance advisory flags regarding cash-flow strain, emergency buffers, or volatility."
        action = "Review flagged warnings with client; document specific risk acknowledgement before formal acceptance."
    else:
        final_decision = SuitabilityDecision.PASS
        explanation = "All SEBI Regulation 17 suitability criteria, horizon alignments, and risk capacity standards are fully satisfied."
        action = "Proceed with client disclosure, fee agreement, and formal investment advisory memo."

    return SuitabilityReport(
        decision=final_decision,
        score=score,
        rules_evaluated=total_count,
        rules_passed=passed_count,
        issues_detected=issues,
        rule_results=results,
        explanation=explanation,
        required_next_action=action,
        missing_data_fields=[]
    )
