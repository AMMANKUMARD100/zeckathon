from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ClientProfileCreate(BaseModel):
    full_name: str
    persona_tag: Optional[str] = None
    age: int = Field(..., ge=18, le=100)
    city: Optional[str] = "India"
    occupation: Optional[str] = "Professional"
    household_details: Optional[str] = None
    
    monthly_take_home_income: float = Field(..., ge=0)
    essential_monthly_expenses: float = Field(..., ge=0)
    discretionary_monthly_expenses: float = Field(default=0.0, ge=0)
    
    existing_savings_investments: float = Field(default=0.0, ge=0)
    emergency_savings: float = Field(default=0.0, ge=0)
    outstanding_loans_liabilities: float = Field(default=0.0, ge=0)
    immediate_liquidity_needs: float = Field(default=0.0, ge=0)

    risk_tolerance_stated: str = Field(..., description="conservative, moderate, aggressive")
    financial_loss_capacity: str = Field(..., description="low, medium, high")
    investment_experience_years: int = Field(default=0, ge=0)
    has_fo_trading_history: bool = False
    fo_drawdown_amount: float = 0.0
    
    special_constraints: Optional[str] = None
    is_illustrative_test_persona: bool = False

class ClientProfileResponse(ClientProfileCreate):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FinancialGoalCreate(BaseModel):
    client_id: str
    goal_name: str
    goal_category: str = Field(..., description="emergency, education, retirement, healthcare, wealth_creation, income_stream")
    target_amount: float = Field(..., gt=0)
    current_dedicated_savings: float = Field(default=0.0, ge=0)
    time_horizon_years: float = Field(..., gt=0)
    is_capital_preservation_priority: bool = False
    liquidity_frequency: str = "none" # "none", "monthly", "immediate"
    monthly_withdrawal_required: float = 0.0
    assumed_inflation_rate: float = 6.0

class FinancialGoalResponse(FinancialGoalCreate):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProposalGenerationRequest(BaseModel):
    client_id: str
    goal_id: str
    assumed_return_rate: Optional[float] = None # if None, derived conservatively based on duration
    custom_equity_pct: Optional[float] = None
    custom_debt_pct: Optional[float] = None
    custom_liquid_pct: Optional[float] = None

class QuestionAnsweringRequest(BaseModel):
    query: str
    doc_id: Optional[str] = None
    top_k: int = 4

class SuitabilityCheckRequest(BaseModel):
    client_id: str
    goal_id: str
    equity_pct: float
    debt_pct: float
    liquid_cash_pct: float
    gold_pct: float = 0.0
