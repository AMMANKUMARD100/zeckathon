from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db, ClientProfileModel, FinancialGoalModel
from ..database.schemas import ClientProfileCreate, ClientProfileResponse

router = APIRouter(prefix="/api/clients", tags=["Clients"])

@router.post("/", response_model=ClientProfileResponse)
def create_client(client_in: ClientProfileCreate, db: Session = Depends(get_db)):
    db_client = ClientProfileModel(**client_in.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.get("/", response_model=List[ClientProfileResponse])
def list_clients(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ClientProfileModel)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ClientProfileModel.full_name.ilike(search_filter)) |
            (ClientProfileModel.persona_tag.ilike(search_filter)) |
            (ClientProfileModel.city.ilike(search_filter))
        )
    return query.order_by(ClientProfileModel.created_at.desc()).all()

@router.get("/{client_id}", response_model=ClientProfileResponse)
def get_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(ClientProfileModel).filter(ClientProfileModel.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")
    return client

@router.delete("/{client_id}")
def delete_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(ClientProfileModel).filter(ClientProfileModel.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client profile not found")
    db.delete(client)
    db.commit()
    return {"success": True, "message": f"Client {client_id} successfully removed"}
