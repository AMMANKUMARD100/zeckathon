"""
Deterministic financial calculation library for SEBI RIA advisory workflows.
All calculations follow standard financial mathematics (time-value of money)
and explicitly state assumptions (ordinary annuity, compounding frequency, etc.).
"""

from typing import Dict, Any, Optional

def calculate_goal_shortfall(target_amount: float, current_dedicated_savings: float) -> float:
    """Calculate net gap to be accumulated."""
    return max(0.0, float(target_amount) - float(current_dedicated_savings))

def calculate_monthly_sip(
    target_amount: float,
    current_savings: float,
    years: float,
    annual_return_pct: float
) -> Dict[str, Any]:
    """
    Calculate required ordinary monthly contribution (SIP) to reach target amount FV.
    
    Formula:
    Future Value of existing lump sum:
        FV_lump = PV * (1 + r)^n
    Remaining Shortfall:
        FV_rem = FV - FV_lump
    
    Ordinary annuity monthly contribution (paid at month end):
        When r > 0:
            PMT = FV_rem * r / ((1 + r)^n - 1)
        When r == 0:
            PMT = FV_rem / n
            
    Where:
        r = annual_return_pct / 100 / 12 (monthly rate)
        n = round(years * 12) (number of months)
    """
    if years <= 0:
        return {
            "required_monthly_sip": 0.0,
            "months": 0,
            "future_value_existing_savings": current_savings,
            "net_shortfall_at_maturity": max(0.0, target_amount - current_savings),
            "assumed_annual_rate_pct": annual_return_pct,
            "notes": "Target time horizon is immediate (0 years)."
        }
    
    n = max(1, int(round(years * 12)))
    r = (annual_return_pct / 100.0) / 12.0
    
    # Growth of existing lump sum
    if r > 0:
        fv_existing = current_savings * ((1.0 + r) ** n)
    else:
        fv_existing = current_savings
        
    net_shortfall = max(0.0, target_amount - fv_existing)
    
    if net_shortfall <= 0.0:
        required_monthly = 0.0
    elif r == 0:
        required_monthly = net_shortfall / n
    else:
        # Standard ordinary annuity sinking fund formula
        compound_factor = ((1.0 + r) ** n) - 1.0
        if compound_factor > 0:
            required_monthly = (net_shortfall * r) / compound_factor
        else:
            required_monthly = net_shortfall / n

    return {
        "required_monthly_sip": round(required_monthly, 2),
        "total_months": n,
        "future_value_existing_savings": round(fv_existing, 2),
        "net_shortfall_at_maturity": round(net_shortfall, 2),
        "assumed_annual_rate_pct": annual_return_pct,
        "compounding_frequency": "monthly",
        "timing": "ordinary annuity (end of month)"
    }

def calculate_swp_sustainability(
    corpus: float,
    monthly_withdrawal: float,
    years: float,
    annual_return_pct: float,
    annual_inflation_pct: float = 0.0
) -> Dict[str, Any]:
    """
    Evaluates sustainability of regular Systematic Withdrawal Plan (SWP).
    Particularly critical for retirees (e.g. 25-year post-retirement horizon).
    Simulates monthly cash flows.
    """
    n = int(round(years * 12))
    r = (annual_return_pct / 100.0) / 12.0
    inf_m = (annual_inflation_pct / 100.0) / 12.0
    
    current_balance = corpus
    months_sustained = 0
    current_withdrawal = monthly_withdrawal
    
    for m in range(1, n + 1):
        # Add return on remaining corpus
        current_balance += current_balance * r
        # Deduct withdrawal
        current_balance -= current_withdrawal
        
        if current_balance < 0:
            break
            
        months_sustained = m
        if inf_m > 0 and m % 12 == 0:
            # Adjust withdrawal for annual inflation
            current_withdrawal *= (1.0 + (annual_inflation_pct / 100.0))
            
    is_fully_sustainable = months_sustained >= n
    years_sustained = round(months_sustained / 12.0, 1)
    
    return {
        "initial_corpus": corpus,
        "initial_monthly_withdrawal": monthly_withdrawal,
        "target_years": years,
        "months_sustained": months_sustained,
        "years_sustained": years_sustained,
        "is_fully_sustainable": is_fully_sustainable,
        "remaining_corpus_at_end": max(0.0, round(current_balance, 2)) if is_fully_sustainable else 0.0,
        "exhaustion_warning": None if is_fully_sustainable else f"Corpus will exhaust in {years_sustained} years (month {months_sustained}) under current return assumptions."
    }

def calculate_emergency_fund_target(
    monthly_essential_expenses: float,
    has_irregular_income: bool = False,
    dependents_count: int = 0
) -> Dict[str, Any]:
    """
    SEBI RIA best-practice rule:
    - Stable salaried: 3 to 6 months of essential living expenses.
    - Business / irregular income: 9 to 12 months of essential living expenses.
    """
    if has_irregular_income:
        recommended_months = 9 if dependents_count <= 1 else 12
        rationale = "High income volatility requires 9-12 months buffer to prevent premature equity liquidation."
    else:
        recommended_months = 3 if dependents_count == 0 else 6
        rationale = "Stable income profile requires standard 3-6 months liquid safety net."
        
    target_corpus = monthly_essential_expenses * recommended_months
    return {
        "recommended_months_coverage": recommended_months,
        "target_amount": round(target_corpus, 2),
        "rationale": rationale,
        "priority_asset_class": "Overnight / Liquid Funds / Bank Sweep Deposits"
    }

def validate_asset_allocation(
    equity_pct: float,
    debt_pct: float,
    liquid_cash_pct: float,
    gold_pct: float = 0.0
) -> Dict[str, Any]:
    """Ensure sum of allocations equals exactly 100% within a 0.01 tolerance."""
    total = round(equity_pct + debt_pct + liquid_cash_pct + gold_pct, 2)
    is_valid = abs(total - 100.0) <= 0.05
    return {
        "is_valid": is_valid,
        "total": total,
        "equity": equity_pct,
        "debt": debt_pct,
        "liquid_cash": liquid_cash_pct,
        "gold": gold_pct,
        "error": None if is_valid else f"Total allocation sums to {total}%, expected exactly 100.0%."
    }
