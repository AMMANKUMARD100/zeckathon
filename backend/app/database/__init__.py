from .connection import Base, engine, SessionLocal, get_db
from .models import (
    ClientProfileModel,
    FinancialGoalModel,
    DocumentRecordModel,
    DocumentChunkModel,
    PortfolioProposalModel
)

def init_db():
    Base.metadata.create_all(bind=engine)

__all__ = [
    "Base",
    "engine",
    "SessionLocal",
    "get_db",
    "init_db",
    "ClientProfileModel",
    "FinancialGoalModel",
    "DocumentRecordModel",
    "DocumentChunkModel",
    "PortfolioProposalModel"
]
