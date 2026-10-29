import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from .connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class ClientProfileModel(Base):
    __tablename__ = "client_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String(120), nullable=False)
    persona_tag = Column(String(50), nullable=True) # e.g. "fresh_graduate", "doctor", etc.
    age = Column(Integer, nullable=False)
    city = Column(String(100), nullable=True)
    occupation = Column(String(120), nullable=True)
    household_details = Column(String(255), nullable=True)
    
    # Financial metrics (monthly INR)
    monthly_take_home_income = Column(Float, nullable=False, default=0.0)
    essential_monthly_expenses = Column(Float, nullable=False, default=0.0)
    discretionary_monthly_expenses = Column(Float, nullable=False, default=0.0)
    
    # Balance sheet (INR)
    existing_savings_investments = Column(Float, nullable=False, default=0.0)
    emergency_savings = Column(Float, nullable=False, default=0.0)
    outstanding_loans_liabilities = Column(Float, nullable=False, default=0.0)
    immediate_liquidity_needs = Column(Float, nullable=False, default=0.0)

    # Risk Capacity vs Risk Willingness (SEBI mandate distinction)
    risk_tolerance_stated = Column(String(30), nullable=False) # "low", "conservative", "moderate", "aggressive"
    financial_loss_capacity = Column(String(30), nullable=False) # "low", "medium", "high"
    investment_experience_years = Column(Integer, nullable=False, default=0)
    has_fo_trading_history = Column(Boolean, default=False)
    fo_drawdown_amount = Column(Float, default=0.0)
    
    special_constraints = Column(Text, nullable=True)
    is_illustrative_test_persona = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    goals = relationship("FinancialGoalModel", back_populates="client", cascade="all, delete-orphan")
    proposals = relationship("PortfolioProposalModel", back_populates="client", cascade="all, delete-orphan")


class FinancialGoalModel(Base):
    __tablename__ = "financial_goals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    client_id = Column(String(36), ForeignKey("client_profiles.id"), nullable=False)
    
    goal_name = Column(String(150), nullable=False) # e.g. "Emergency Fund", "Child Education", "Retirement"
    goal_category = Column(String(50), nullable=False) # "emergency", "education", "retirement", "healthcare", "wealth_creation", "income_stream"
    target_amount = Column(Float, nullable=False)
    current_dedicated_savings = Column(Float, default=0.0)
    time_horizon_years = Column(Float, nullable=False) # can be fractional
    is_capital_preservation_priority = Column(Boolean, default=False)
    liquidity_frequency = Column(String(30), default="none") # "none", "monthly", "annually", "immediate"
    monthly_withdrawal_required = Column(Float, default=0.0) # for pensions/retirees
    
    assumed_inflation_rate = Column(Float, default=6.0) # percentage
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("ClientProfileModel", back_populates="goals")
    proposals = relationship("PortfolioProposalModel", back_populates="goal", cascade="all, delete-orphan")


class DocumentRecordModel(Base):
    __tablename__ = "document_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    fund_house = Column(String(100), nullable=True) # e.g. "HDFC Mutual Fund", "SBI Mutual Fund"
    scheme_name = Column(String(200), nullable=True)
    category = Column(String(80), nullable=True) # "equity_large_cap", "debt_liquid", "hybrid", etc.
    doc_type = Column(String(50), nullable=False) # "SID", "factsheet", "KIM", "rulebook"
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    source_notes = Column(Text, nullable=True) # "Public SEBI / AMC filing", "AMFI factsheet"
    
    total_pages = Column(Integer, default=0)
    status = Column(String(50), default="pending") # "pending", "indexed", "failed"
    index_error = Column(Text, nullable=True)
    indexed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("DocumentChunkModel", back_populates="document", cascade="all, delete-orphan")


class DocumentChunkModel(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("document_records.id"), nullable=False)
    page_number = Column(Integer, nullable=False) # 1-indexed PDF viewer page
    section_heading = Column(String(255), nullable=True)
    chunk_text = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    
    document = relationship("DocumentRecordModel", back_populates="chunks")


class PortfolioProposalModel(Base):
    __tablename__ = "portfolio_proposals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    client_id = Column(String(36), ForeignKey("client_profiles.id"), nullable=False)
    goal_id = Column(String(36), ForeignKey("financial_goals.id"), nullable=False)
    
    # Financial calculation results
    target_amount = Column(Float, nullable=False)
    shortfall = Column(Float, nullable=False)
    recommended_monthly_sip = Column(Float, nullable=False)
    assumed_return_rate = Column(Float, nullable=False) # e.g. 10.0 for 10%
    calculation_basis_notes = Column(Text, nullable=True)

    # Proposed Asset Allocation (Percentages summing to 100)
    equity_pct = Column(Float, nullable=False, default=0.0)
    debt_pct = Column(Float, nullable=False, default=0.0)
    liquid_cash_pct = Column(Float, nullable=False, default=0.0)
    gold_pct = Column(Float, nullable=False, default=0.0)
    
    # Recommended verified categories / schemes
    allocation_details = Column(JSON, nullable=True) # list of {category, fund_type, percentage, rationale, cited_doc_id}

    # Suitability Engine Output
    suitability_decision = Column(String(30), nullable=False) # "PASS", "FLAG", "REJECT", "INSUFFICIENT_DATA"
    suitability_score = Column(Float, default=0.0)
    passed_rules = Column(JSON, default=list)
    failed_rules = Column(JSON, default=list)
    flagged_issues = Column(JSON, default=list)
    required_next_action = Column(Text, nullable=True)
    
    investment_rationale = Column(Text, nullable=True)
    risk_disclosures = Column(JSON, default=list)
    limitations_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("ClientProfileModel", back_populates="proposals")
    goal = relationship("FinancialGoalModel", back_populates="proposals")
