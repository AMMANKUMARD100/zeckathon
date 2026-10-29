from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..database import (
    get_db,
    ClientProfileModel,
    FinancialGoalModel,
    PortfolioProposalModel,
    DocumentRecordModel
)
from ..database.schemas import ProposalGenerationRequest, SuitabilityCheckRequest
from ..portfolio.calculations import (
    calculate_monthly_sip,
    calculate_goal_shortfall,
    validate_asset_allocation,
    calculate_swp_sustainability
)
from ..suitability import evaluate_suitability, SuitabilityDecision
from ..llm import llm_service

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio Builder"])

def derive_default_allocation(horizon: float, risk_capacity: str, risk_tolerance: str, category: str) -> Dict[str, float]:
    """
    Derives sensible, compliant baseline asset allocation for Indian mutual funds.
    """
    if category == "emergency" or horizon < 1.0:
        return {"equity_pct": 0.0, "debt_pct": 30.0, "liquid_cash_pct": 70.0, "gold_pct": 0.0}
    elif horizon < 3.0:
        return {"equity_pct": 15.0, "debt_pct": 60.0, "liquid_cash_pct": 25.0, "gold_pct": 0.0}
    elif category == "income_stream" or risk_capacity == "low":
        return {"equity_pct": 25.0, "debt_pct": 55.0, "liquid_cash_pct": 20.0, "gold_pct": 0.0}
    elif horizon >= 10.0:
        if risk_tolerance == "conservative":
            return {"equity_pct": 50.0, "debt_pct": 40.0, "liquid_cash_pct": 10.0, "gold_pct": 0.0}
        elif risk_tolerance == "aggressive" and risk_capacity != "low":
            return {"equity_pct": 75.0, "debt_pct": 20.0, "liquid_cash_pct": 5.0, "gold_pct": 0.0}
        else:
            return {"equity_pct": 65.0, "debt_pct": 25.0, "liquid_cash_pct": 10.0, "gold_pct": 0.0}
    else: # 3 to 10 years
        return {"equity_pct": 50.0, "debt_pct": 35.0, "liquid_cash_pct": 15.0, "gold_pct": 0.0}

@router.post("/evaluate-suitability")
def check_suitability_endpoint(req: SuitabilityCheckRequest, db: Session = Depends(get_db)):
    client = db.query(ClientProfileModel).filter(ClientProfileModel.id == req.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    goal = db.query(FinancialGoalModel).filter(FinancialGoalModel.id == req.goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    alloc = {
        "equity_pct": req.equity_pct,
        "debt_pct": req.debt_pct,
        "liquid_cash_pct": req.liquid_cash_pct,
        "gold_pct": req.gold_pct
    }

    report = evaluate_suitability(
        client=client.__dict__,
        goal=goal.__dict__,
        proposed_allocation=alloc
    )
    return report.dict()

@router.post("/generate-proposal")
def generate_proposal(req: ProposalGenerationRequest, db: Session = Depends(get_db)):
    client = db.query(ClientProfileModel).filter(ClientProfileModel.id == req.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")
    goal = db.query(FinancialGoalModel).filter(FinancialGoalModel.id == req.goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # 1. Determine Allocation
    if req.custom_equity_pct is not None and req.custom_debt_pct is not None and req.custom_liquid_pct is not None:
        alloc = {
            "equity_pct": req.custom_equity_pct,
            "debt_pct": req.custom_debt_pct,
            "liquid_cash_pct": req.custom_liquid_pct,
            "gold_pct": 0.0
        }
    else:
        alloc = derive_default_allocation(
            horizon=goal.time_horizon_years,
            risk_capacity=client.financial_loss_capacity,
            risk_tolerance=client.risk_tolerance_stated,
            category=goal.goal_category
        )

    # Validate sum equals 100%
    val = validate_asset_allocation(**alloc)
    if not val["is_valid"]:
        raise HTTPException(status_code=400, detail=val["error"])

    # 2. Run SEBI Suitability Compliance Engine
    suitability_report = evaluate_suitability(
        client=client.__dict__,
        goal=goal.__dict__,
        proposed_allocation=alloc
    )

    # 3. Financial calculations
    # Conservative return assumptions (clearly disclosed, never guaranteed)
    if req.assumed_return_rate is not None:
        assumed_rate = req.assumed_return_rate
    else:
        # Weighted return estimate: Equity ~11%, Debt ~6.5%, Liquid ~5.5%
        eq = alloc["equity_pct"]
        dt = alloc["debt_pct"]
        lq = alloc["liquid_cash_pct"]
        assumed_rate = round((eq * 0.11) + (dt * 0.065) + (lq * 0.055), 2)

    sip_calc = calculate_monthly_sip(
        target_amount=goal.target_amount,
        current_savings=goal.current_dedicated_savings,
        years=goal.time_horizon_years,
        annual_return_pct=assumed_rate
    )

    # SWP calculation if monthly withdrawal requested
    swp_res = None
    if goal.monthly_withdrawal_required > 0:
        swp_res = calculate_swp_sustainability(
            corpus=goal.current_dedicated_savings or goal.target_amount,
            monthly_withdrawal=goal.monthly_withdrawal_required,
            years=goal.time_horizon_years,
            annual_return_pct=assumed_rate,
            annual_inflation_pct=goal.assumed_inflation_rate
        )

    # Detailed mutual fund categories
    allocation_details = [
        {
            "asset_class": "Equity",
            "category_name": "Flexi-Cap / Large & Mid Cap Fund",
            "percentage": alloc["equity_pct"],
            "rationale": "Long-term capital compounding and beating inflation.",
            "sebi_risk_meter": "Very High" if alloc["equity_pct"] > 0 else "N/A"
        },
        {
            "asset_class": "Debt",
            "category_name": "Banking & PSU Debt / Short Duration Fund",
            "percentage": alloc["debt_pct"],
            "rationale": "High credit safety and regular accrual income.",
            "sebi_risk_meter": "Moderate" if alloc["debt_pct"] > 0 else "N/A"
        },
        {
            "asset_class": "Liquid / Cash",
            "category_name": "Overnight / Liquid Mutual Fund",
            "percentage": alloc["liquid_cash_pct"],
            "rationale": "Immediate capital preservation with T+1 liquidity.",
            "sebi_risk_meter": "Low"
        }
    ]

    # Explainable Rationale
    rationale = llm_service.generate_portfolio_rationale(
        client_name=client.full_name,
        goal_name=goal.goal_name,
        time_horizon=goal.time_horizon_years,
        allocation=alloc,
        suitability_decision=suitability_report.decision.value,
        passed_rules=[r.rule_name for r in suitability_report.rule_results if r.is_passed],
        issues=suitability_report.issues_detected
    )

    # Risk Disclosures
    risk_disclosures = [
        "Mutual Fund investments are subject to market risks, read all scheme related documents carefully.",
        f"Projections assume an illustrative compound growth rate of {assumed_rate}% p.a. which is NOT guaranteed.",
        "Past performance does not predict future returns. Taxation and expense ratios may affect net yields."
    ]
    if suitability_report.decision == SuitabilityDecision.REJECT:
        risk_disclosures.insert(0, "WARNING: THIS PROPOSAL HAS BEEN REJECTED BY THE SEBI COMPLIANCE ENGINE AND IS NOT EXECUTABLE.")

    # Save proposal record in DB
    db_proposal = PortfolioProposalModel(
        client_id=client.id,
        goal_id=goal.id,
        target_amount=goal.target_amount,
        shortfall=sip_calc["net_shortfall_at_maturity"],
        recommended_monthly_sip=sip_calc["required_monthly_sip"],
        assumed_return_rate=assumed_rate,
        calculation_basis_notes=f"Calculated using ordinary annuity sinking fund formula over {goal.time_horizon_years} years ({sip_calc['total_months']} months).",
        equity_pct=alloc["equity_pct"],
        debt_pct=alloc["debt_pct"],
        liquid_cash_pct=alloc["liquid_cash_pct"],
        gold_pct=alloc.get("gold_pct", 0.0),
        allocation_details=allocation_details,
        suitability_decision=suitability_report.decision.value,
        suitability_score=suitability_report.score,
        passed_rules=[r.dict() for r in suitability_report.rule_results if r.is_passed],
        failed_rules=[r.dict() for r in suitability_report.rule_results if not r.is_passed],
        flagged_issues=suitability_report.issues_detected,
        required_next_action=suitability_report.required_next_action,
        investment_rationale=rationale,
        risk_disclosures=risk_disclosures,
        limitations_notes="Model portfolio generated for RIA co-pilot deliberation. Requires final client sign-off."
    )
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)

    return {
        "proposal_id": db_proposal.id,
        "client": {
            "id": client.id,
            "name": client.full_name,
            "age": client.age,
            "income": client.monthly_take_home_income,
            "loss_capacity": client.financial_loss_capacity,
            "risk_tolerance": client.risk_tolerance_stated
        },
        "goal": {
            "id": goal.id,
            "name": goal.goal_name,
            "category": goal.goal_category,
            "target_amount": goal.target_amount,
            "horizon_years": goal.time_horizon_years,
            "monthly_withdrawal": goal.monthly_withdrawal_required
        },
        "calculations": sip_calc,
        "swp_sustainability": swp_res,
        "proposed_allocation": alloc,
        "allocation_details": allocation_details,
        "suitability": suitability_report.dict(),
        "rationale": rationale,
        "risk_disclosures": risk_disclosures,
        "created_at": db_proposal.created_at
    }

@router.get("/proposals")
def list_proposals(db: Session = Depends(get_db)):
    proposals = db.query(PortfolioProposalModel).order_by(PortfolioProposalModel.created_at.desc()).all()
    out = []
    for p in proposals:
        out.append({
            "id": p.id,
            "client_id": p.client_id,
            "client_name": p.client.full_name if p.client else "Unknown",
            "goal_id": p.goal_id,
            "goal_name": p.goal.goal_name if p.goal else "Unknown",
            "target_amount": p.target_amount,
            "shortfall": p.shortfall,
            "recommended_monthly_sip": p.recommended_monthly_sip,
            "assumed_return_rate": p.assumed_return_rate,
            "allocation": {
                "equity_pct": p.equity_pct,
                "debt_pct": p.debt_pct,
                "liquid_cash_pct": p.liquid_cash_pct,
                "gold_pct": p.gold_pct
            },
            "suitability_decision": p.suitability_decision,
            "suitability_score": p.suitability_score,
            "flagged_issues": p.flagged_issues,
            "created_at": p.created_at
        })
    return out

@router.get("/proposals/{proposal_id}")
def get_proposal_detail(proposal_id: str, db: Session = Depends(get_db)):
    p = db.query(PortfolioProposalModel).filter(PortfolioProposalModel.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {
        "id": p.id,
        "client": {
            "id": p.client_id,
            "name": p.client.full_name if p.client else "",
            "age": p.client.age if p.client else 0,
            "persona_tag": p.client.persona_tag if p.client else "",
            "loss_capacity": p.client.financial_loss_capacity if p.client else "",
            "risk_tolerance": p.client.risk_tolerance_stated if p.client else ""
        },
        "goal": {
            "id": p.goal_id,
            "name": p.goal.goal_name if p.goal else "",
            "category": p.goal.goal_category if p.goal else "",
            "target_amount": p.target_amount,
            "horizon_years": p.goal.time_horizon_years if p.goal else 0
        },
        "shortfall": p.shortfall,
        "recommended_monthly_sip": p.recommended_monthly_sip,
        "assumed_return_rate": p.assumed_return_rate,
        "calculation_basis_notes": p.calculation_basis_notes,
        "allocation": {
            "equity_pct": p.equity_pct,
            "debt_pct": p.debt_pct,
            "liquid_cash_pct": p.liquid_cash_pct,
            "gold_pct": p.gold_pct
        },
        "allocation_details": p.allocation_details,
        "suitability_decision": p.suitability_decision,
        "suitability_score": p.suitability_score,
        "passed_rules": p.passed_rules,
        "failed_rules": p.failed_rules,
        "flagged_issues": p.flagged_issues,
        "required_next_action": p.required_next_action,
        "investment_rationale": p.investment_rationale,
        "risk_disclosures": p.risk_disclosures,
        "limitations_notes": p.limitations_notes,
        "created_at": p.created_at
    }
