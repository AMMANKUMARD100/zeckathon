import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .configuration.settings import settings
from .database import init_db, get_db, ClientProfileModel, FinancialGoalModel, DocumentRecordModel, PortfolioProposalModel
from .retrieval import extract_pdf_and_index
from .clients.routes import router as clients_router
from .goals.routes import router as goals_router
from .documents.routes import router as docs_router
from .retrieval.routes import router as rag_router
from .portfolio.routes import router as portfolio_router
from .evaluation.routes import router as eval_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Compliant AI Advisory Co-pilot for SEBI-Registered Investment Advisers (RIAs)"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(clients_router)
app.include_router(goals_router)
app.include_router(docs_router)
app.include_router(rag_router)
app.include_router(portfolio_router)
app.include_router(eval_router)

@app.on_event("startup")
def startup_event():
    # Initialize DB tables
    init_db()
    
    # Auto-index sample documents if present
    try:
        db = next(get_db())
        # Find project root (where backend/ lives)
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        sample_files = [
            ("rulebook.pdf", "Zetheta × IIT Patna Hackathon Official Rulebook", "rulebook"),
            ("sample_data/Sample_Axis_Bluechip_SID.pdf", "Sample Axis Bluechip SID (Illustrative)", "SID"),
        ]
        
        for rel_path, title, doc_type in sample_files:
            abs_path = os.path.join(project_root, rel_path)
            if os.path.exists(abs_path):
                existing = db.query(DocumentRecordModel).filter(
                    DocumentRecordModel.title == title
                ).first()
                if not existing:
                    try:
                        db_doc = DocumentRecordModel(
                            title=title,
                            fund_house="Sample / Competition",
                            doc_type=doc_type,
                            filename=os.path.basename(rel_path),
                            filepath=abs_path,
                            file_size_bytes=os.path.getsize(abs_path),
                            source_notes="Auto-indexed on startup",
                            status="pending"
                        )
                        db.add(db_doc)
                        db.commit()
                        db.refresh(db_doc)
                        
                        idx_res = extract_pdf_and_index(abs_path, db_doc.id, title)
                        if idx_res["success"]:
                            db_doc.status = "indexed"
                            db_doc.total_pages = idx_res["pages"]
                        else:
                            db_doc.status = "failed"
                            db_doc.index_error = idx_res.get("error")
                        db.commit()
                    except Exception as e:
                        db.rollback()
                else:
                    # Re-populate in-memory index on server reboot
                    try:
                        extract_pdf_and_index(existing.filepath, existing.id, existing.title)
                    except Exception:
                        pass
        db.close()
    except Exception:
        pass

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Live computed statistics for the adviser dashboard."""
    clients_count = db.query(ClientProfileModel).count()
    goals_count = db.query(FinancialGoalModel).count()
    proposals_count = db.query(PortfolioProposalModel).count()
    flagged_or_rejected = db.query(PortfolioProposalModel).filter(
        PortfolioProposalModel.suitability_decision.in_(["FLAG", "REJECT"])
    ).count()
    documents_count = db.query(DocumentRecordModel).count()

    recent_proposals = db.query(PortfolioProposalModel).order_by(
        PortfolioProposalModel.created_at.desc()
    ).limit(5).all()

    recent_activity = []
    for p in recent_proposals:
        recent_activity.append({
            "id": p.id,
            "client_name": p.client.full_name if p.client else "Unknown",
            "goal_name": p.goal.goal_name if p.goal else "Unknown",
            "decision": p.suitability_decision,
            "score": p.suitability_score,
            "sip": p.recommended_monthly_sip,
            "created_at": p.created_at
        })

    return {
        "total_clients": clients_count,
        "active_goals": goals_count,
        "proposals_generated": proposals_count,
        "suitability_issues_flagged": flagged_or_rejected,
        "indexed_documents": documents_count,
        "recent_activity": recent_activity
    }
