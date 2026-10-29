from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import (
    get_db,
    ClientProfileModel,
    FinancialGoalModel,
    PortfolioProposalModel
)
from ..evaluation.personas import SIX_EVALUATION_PERSONAS, get_persona_by_id
from ..portfolio.routes import generate_proposal, derive_default_allocation
from ..database.schemas import ProposalGenerationRequest
from ..suitability import evaluate_suitability

router = APIRouter(prefix="/api/evaluation", tags=["Evaluation Lab"])

@router.get("/personas")
def list_evaluation_personas():
    """Returns the 6 official rulebook personas with their official facts and labelled test assumptions."""
    return SIX_EVALUATION_PERSONAS

@router.post("/personas/{persona_id}/load")
def load_persona_scenario(persona_id: str, db: Session = Depends(get_db)):
    """
    Loads or resets a persona into the database, creating client profile and goals.
    Allows instant testing of the official scenario in the live dashboard.
    """
    persona = get_persona_by_id(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found in rulebook matrix")

    # Check if client already exists, if so delete and refresh to clean slate
    existing_client = db.query(ClientProfileModel).filter(
        ClientProfileModel.persona_tag == persona_id
    ).first()
    if existing_client:
        db.delete(existing_client)
        db.commit()

    # Create Client
    facts = persona["official_facts"]
    assumptions = persona["test_assumptions"]

    new_client = ClientProfileModel(
        full_name=f"{persona['tag']} (Official Test)",
        persona_tag=persona_id,
        age=facts["age"],
        city=assumptions.get("city", "India"),
        occupation=assumptions.get("occupation", "Professional"),
        household_details=assumptions.get("household_details", ""),
        monthly_take_home_income=facts["monthly_take_home_income"],
        essential_monthly_expenses=assumptions["essential_monthly_expenses"],
        discretionary_monthly_expenses=assumptions["discretionary_monthly_expenses"],
        existing_savings_investments=assumptions["existing_savings_investments"],
        emergency_savings=assumptions["emergency_savings"],
        outstanding_loans_liabilities=assumptions["outstanding_loans_liabilities"],
        immediate_liquidity_needs=assumptions["immediate_liquidity_needs"],
        risk_tolerance_stated=assumptions["risk_tolerance_stated"],
        financial_loss_capacity=assumptions["financial_loss_capacity"],
        investment_experience_years=assumptions["investment_experience_years"],
        has_fo_trading_history=assumptions["has_fo_trading_history"],
        fo_drawdown_amount=assumptions["fo_drawdown_amount"],
        is_illustrative_test_persona=True
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    # Add Goals
    created_goals = []
    for g in persona["goals"]:
        new_goal = FinancialGoalModel(
            client_id=new_client.id,
            goal_name=g["goal_name"],
            goal_category=g["goal_category"],
            target_amount=g["target_amount"],
            current_dedicated_savings=g["current_dedicated_savings"],
            time_horizon_years=g["time_horizon_years"],
            is_capital_preservation_priority=g["is_capital_preservation_priority"],
            liquidity_frequency=g["liquidity_frequency"],
            monthly_withdrawal_required=g.get("monthly_withdrawal_required", 0.0),
            assumed_inflation_rate=g.get("assumed_inflation_rate", 6.0)
        )
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)
        created_goals.append(new_goal)

    # Automatically generate illustrative proposal for the primary goal
    primary_goal = created_goals[0]
    
    # In aggressive trader, try allocating high equity to trigger suitability enforcement
    if persona_id == "aggressive_trader":
        req = ProposalGenerationRequest(
            client_id=new_client.id,
            goal_id=primary_goal.id,
            custom_equity_pct=85.0, # Deliberate high risk test to demonstrate rejection!
            custom_debt_pct=10.0,
            custom_liquid_pct=5.0
        )
    elif persona_id == "retiree_chennai":
        req = ProposalGenerationRequest(
            client_id=new_client.id,
            goal_id=primary_goal.id,
            custom_equity_pct=20.0,
            custom_debt_pct=60.0,
            custom_liquid_pct=20.0
        )
    else:
        req = ProposalGenerationRequest(
            client_id=new_client.id,
            goal_id=primary_goal.id
        )

    proposal_result = generate_proposal(req=req, db=db)

    return {
        "success": True,
        "persona_id": persona_id,
        "persona_name": persona["tag"],
        "client_id": new_client.id,
        "primary_goal_id": primary_goal.id,
        "goals_count": len(created_goals),
        "generated_proposal": proposal_result,
        "expected_behavior": persona["expected_suitability_behavior"]
    }
