"""
Official Hackathon Personas from Zetheta × IIT Patna Rulebook (Page 3 & 4).

Supplied Facts:
1. Fresh Graduate: 23 yrs | ₹55k/mo take-home | Emergency fund creation -> Long-term wealth
2. Young Couple: 31 yrs | Dual income, home loan | Child education in 15 years
3. Small Business: 44 yrs | Irregular cash flow | Structured retirement at age 58
4. Doctor (Patna): 38 yrs | High income, risk-averse | Retirement + Parent healthcare corpus
5. Retiree (Chennai): 68 yrs | ₹80L corpus + pension | Monthly income stream for 25 years
6. Aggressive Trader: 29 yrs | F&O drawdown history | Requires suitability enforcement / risk flag

All extra parameters are explicitly flagged as 'illustrative test assumptions' per prompt instructions.
"""

from typing import List, Dict, Any

SIX_EVALUATION_PERSONAS: List[Dict[str, Any]] = [
    {
        "persona_id": "fresh_graduate",
        "tag": "Fresh Graduate",
        "official_facts": {
            "age": 23,
            "monthly_take_home_income": 55000.0,
            "primary_financial_goal": "Emergency fund creation -> Long-term wealth"
        },
        "test_assumptions": {
            "city": "Bengaluru",
            "occupation": "Associate Software Engineer",
            "household_details": "Single, living in shared rented apartment",
            "essential_monthly_expenses": 25000.0,
            "discretionary_monthly_expenses": 10000.0,
            "existing_savings_investments": 30000.0,
            "emergency_savings": 20000.0, # Below 3 months essential (₹75k required)
            "outstanding_loans_liabilities": 0.0,
            "immediate_liquidity_needs": 10000.0,
            "risk_tolerance_stated": "aggressive",
            "financial_loss_capacity": "medium",
            "investment_experience_years": 1,
            "has_fo_trading_history": False,
            "fo_drawdown_amount": 0.0
        },
        "goals": [
            {
                "goal_name": "Emergency Reserve (3 Months Essential Expenses)",
                "goal_category": "emergency",
                "target_amount": 75000.0,
                "current_dedicated_savings": 20000.0,
                "time_horizon_years": 0.5, # 6 months
                "is_capital_preservation_priority": True,
                "liquidity_frequency": "immediate",
                "monthly_withdrawal_required": 0.0,
                "assumed_inflation_rate": 6.0
            },
            {
                "goal_name": "Long-Term Wealth Accumulation",
                "goal_category": "wealth_creation",
                "target_amount": 2500000.0,
                "current_dedicated_savings": 10000.0,
                "time_horizon_years": 10.0,
                "is_capital_preservation_priority": False,
                "liquidity_frequency": "none",
                "monthly_withdrawal_required": 0.0,
                "assumed_inflation_rate": 6.0
            }
        ],
        "expected_suitability_behavior": "Must enforce emergency fund creation (liquid/overnight funds) before allocating high percentages into volatile equity."
    },
    {
        "persona_id": "young_couple",
        "tag": "Young Couple",
        "official_facts": {
            "age": 31,
            "monthly_take_home_income": 160000.0, # Combined dual income
            "primary_financial_goal": "Child education in 15 years",
            "constraints": "Dual income, home loan"
        },
        "test_assumptions": {
            "city": "Pune",
            "occupation": "IT Project Manager & Marketing Consultant",
            "household_details": "Married, 1 child (age 1)",
            "essential_monthly_expenses": 65000.0, # Includes Home Loan EMI ₹40k
            "discretionary_monthly_expenses": 25000.0,
            "existing_savings_investments": 600000.0,
            "emergency_savings": 250000.0,
            "outstanding_loans_liabilities": 4500000.0, # Home Loan outstanding
            "immediate_liquidity_needs": 30000.0,
            "risk_tolerance_stated": "moderate",
            "financial_loss_capacity": "medium",
            "investment_experience_years": 5,
            "has_fo_trading_history": False,
            "fo_drawdown_amount": 0.0
        },
        "goals": [
            {
                "goal_name": "Higher Education Corpus for Child",
                "goal_category": "education",
                "target_amount": 5000000.0, # ₹50 Lakhs
                "current_dedicated_savings": 200000.0,
                "time_horizon_years": 15.0,
                "is_capital_preservation_priority": False,
                "liquidity_frequency": "none",
                "monthly_withdrawal_required": 0.0,
                "assumed_inflation_rate": 7.0
            }
        ],
        "expected_suitability_behavior": "Long 15-year horizon justifies high equity (65-75%) diversified across Large & Flexi-cap funds, with planned glide path towards debt in years 12-15."
    },
    {
        "persona_id": "small_business",
        "tag": "Small Business",
        "official_facts": {
            "age": 44,
            "monthly_take_home_income": 120000.0, # Average monthly draw
            "primary_financial_goal": "Structured retirement at age 58",
            "constraints": "Irregular cash flow"
        },
        "test_assumptions": {
            "city": "Surat",
            "occupation": "Manufacturing Enterprise Owner",
            "household_details": "Married, 2 teenage dependents",
            "essential_monthly_expenses": 55000.0,
            "discretionary_monthly_expenses": 20000.0,
            "existing_savings_investments": 1800000.0,
            "emergency_savings": 200000.0, # Only 3.6 months (inadequate for business volatility)
            "outstanding_loans_liabilities": 800000.0, # Working capital overdraft
            "immediate_liquidity_needs": 50000.0,
            "risk_tolerance_stated": "moderate",
            "financial_loss_capacity": "medium",
            "investment_experience_years": 8,
            "has_fo_trading_history": False,
            "fo_drawdown_amount": 0.0
        },
        "goals": [
            {
                "goal_name": "Structured Retirement Corpus at Age 58",
                "goal_category": "retirement",
                "target_amount": 20000000.0, # ₹2 Crore
                "current_dedicated_savings": 1200000.0,
                "time_horizon_years": 14.0, # 58 - 44
                "is_capital_preservation_priority": True,
                "liquidity_frequency": "none",
                "monthly_withdrawal_required": 0.0,
                "assumed_inflation_rate": 6.5
            }
        ],
        "expected_suitability_behavior": "Engine must flag irregular cash flow risk and mandate 9-12 months emergency liquid buffer before committing large inflexible SIP commitments."
    },
    {
        "persona_id": "doctor_patna",
        "tag": "Doctor (Patna)",
        "official_facts": {
            "age": 38,
            "monthly_take_home_income": 250000.0,
            "primary_financial_goal": "Retirement + Parent healthcare corpus",
            "constraints": "High income and risk-averse"
        },
        "test_assumptions": {
            "city": "Patna",
            "occupation": "Consultant Surgeon",
            "household_details": "Married, dependent elderly parents (age 68 & 65)",
            "essential_monthly_expenses": 70000.0,
            "discretionary_monthly_expenses": 35000.0,
            "existing_savings_investments": 4500000.0,
            "emergency_savings": 800000.0,
            "outstanding_loans_liabilities": 0.0,
            "immediate_liquidity_needs": 200000.0,
            "risk_tolerance_stated": "conservative",
            "financial_loss_capacity": "high", # High income gives capacity, but psychological tolerance is conservative!
            "investment_experience_years": 6,
            "has_fo_trading_history": False,
            "fo_drawdown_amount": 0.0
        },
        "goals": [
            {
                "goal_name": "Parent Healthcare Liquid Corpus",
                "goal_category": "healthcare",
                "target_amount": 2500000.0, # ₹25 Lakhs
                "current_dedicated_savings": 1000000.0,
                "time_horizon_years": 2.0, # Short horizon for medical safety
                "is_capital_preservation_priority": True,
                "liquidity_frequency": "immediate",
                "monthly_withdrawal_required": 0.0,
                "assumed_inflation_rate": 8.0 # High healthcare inflation
            },
            {
                "goal_name": "Long-Term Retirement Corpus",
                "goal_category": "retirement",
                "target_amount": 40000000.0, # ₹4 Crore
                "current_dedicated_savings": 2500000.0,
                "time_horizon_years": 22.0, # Retires at 60
                "is_capital_preservation_priority": False,
                "liquidity_frequency": "none",
                "monthly_withdrawal_required": 0.0,
                "assumed_inflation_rate": 6.0
            }
        ],
        "expected_suitability_behavior": "Healthcare corpus MUST be in pure liquid/debt funds (zero equity). Retirement goal must respect conservative profile via hybrid conservative/balanced allocation rather than 100% pure equity."
    },
    {
        "persona_id": "retiree_chennai",
        "tag": "Retiree (Chennai)",
        "official_facts": {
            "age": 68,
            "monthly_take_home_income": 35000.0, # Monthly pension
            "primary_financial_goal": "Monthly income stream for 25 years",
            "corpus": "₹80 lakh corpus + pension"
        },
        "test_assumptions": {
            "city": "Chennai",
            "occupation": "Retired Public Sector Executive",
            "household_details": "Senior citizen, living with spouse (age 64)",
            "essential_monthly_expenses": 65000.0, # Pension covers ₹35k, shortfall is ₹30k/mo
            "discretionary_monthly_expenses": 15000.0,
            "existing_savings_investments": 8000000.0, # ₹80 Lakhs
            "emergency_savings": 600000.0,
            "outstanding_loans_liabilities": 0.0,
            "immediate_liquidity_needs": 100000.0,
            "risk_tolerance_stated": "conservative",
            "financial_loss_capacity": "low", # Low loss capacity due to no active replenishment income
            "investment_experience_years": 25,
            "has_fo_trading_history": False,
            "fo_drawdown_amount": 0.0
        },
        "goals": [
            {
                "goal_name": "Lifelong SWP Monthly Income Stream (25 Years)",
                "goal_category": "income_stream",
                "target_amount": 8000000.0,
                "current_dedicated_savings": 8000000.0,
                "time_horizon_years": 25.0,
                "is_capital_preservation_priority": True,
                "liquidity_frequency": "monthly",
                "monthly_withdrawal_required": 45000.0, # Net supplemental monthly draw
                "assumed_inflation_rate": 5.0
            }
        ],
        "expected_suitability_behavior": "Strictly caps equity at 20-25% (conservative hybrid / equity savings) to prevent capital destruction, while allocating 75-80% into Banking & PSU Debt, Corporate Bond, and Liquid funds for SWP."
    },
    {
        "persona_id": "aggressive_trader",
        "tag": "Aggressive Trader",
        "official_facts": {
            "age": 29,
            "monthly_take_home_income": 95000.0,
            "primary_financial_goal": "Requires suitability enforcement / risk flag",
            "constraints": "History of F&O drawdowns"
        },
        "test_assumptions": {
            "city": "Mumbai",
            "occupation": "Digital Marketing Specialist & Active Retail Trader",
            "household_details": "Single, urban apartment",
            "essential_monthly_expenses": 40000.0,
            "discretionary_monthly_expenses": 25000.0,
            "existing_savings_investments": 450000.0,
            "emergency_savings": 50000.0, # Inadequate
            "outstanding_loans_liabilities": 250000.0, # Personal loan taken for margin call
            "immediate_liquidity_needs": 50000.0,
            "risk_tolerance_stated": "aggressive",
            "financial_loss_capacity": "low", # Disconnect! High stated appetite, low true capacity
            "investment_experience_years": 3,
            "has_fo_trading_history": True,
            "fo_drawdown_amount": 650000.0 # Suffered heavy derivative loss
        },
        "goals": [
            {
                "goal_name": "High-Beta Speculative Wealth Multiplier",
                "goal_category": "wealth_creation",
                "target_amount": 5000000.0,
                "current_dedicated_savings": 150000.0,
                "time_horizon_years": 2.0, # Highly volatile near-term ask
                "is_capital_preservation_priority": False,
                "liquidity_frequency": "none",
                "monthly_withdrawal_required": 0.0,
                "assumed_inflation_rate": 6.0
            }
        ],
        "expected_suitability_behavior": "MANDATORY REJECTION: Suitability engine flags F&O loss history, near-term horizon mismatch (2 years with aggressive high-risk ask), personal loan debt, and low actual loss capacity. Blocks speculative allocation and enforces capital repair framework."
    }
]

def get_persona_by_id(persona_id: str) -> Dict[str, Any]:
    for p in SIX_EVALUATION_PERSONAS:
        if p["persona_id"] == persona_id:
            return p
    return None
