from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db, FinancialGoalModel, ClientProfileModel
from ..database.schemas import FinancialGoalCreate, FinancialGoalResponse
from ..portfolio.calculations import calculate_monthly_sip, calculate_goal_shortfall

router = APIRouter(prefix="/api/goals", tags=["Goals"])

@router.post("/", response_model=FinancialGoalResponse)
def create_goal(goal_in: FinancialGoalCreate, db: Session = Depends(get_db)):
    client = db.query(ClientProfileModel).filter(ClientProfileModel.id == goal_in.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Associated client profile does not exist")
        
    db_goal = FinancialGoalModel(**goal_in.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/client/{client_id}", response_model=List[FinancialGoalResponse])
def get_client_goals(client_id: str, db: Session = Depends(get_db)):
    return db.query(FinancialGoalModel).filter(FinancialGoalModel.client_id == client_id).all()

@router.get("/{goal_id}", response_model=FinancialGoalResponse)
def get_goal(goal_id: str, db: Session = Depends(get_db)):
    goal = db.query(FinancialGoalModel).filter(FinancialGoalModel.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Financial goal not found")
    return goal

@router.delete("/{goal_id}")
def delete_goal(goal_id: str, db: Session = Depends(get_db)):
    goal = db.query(FinancialGoalModel).filter(FinancialGoalModel.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Financial goal not found")
    db.delete(goal)
    db.commit()
    return {"success": True, "message": f"Goal {goal_id} deleted"}
