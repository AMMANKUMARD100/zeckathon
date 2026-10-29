from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from ..database import get_db, DocumentRecordModel
from ..database.schemas import QuestionAnsweringRequest
from ..retrieval import query_documents
from ..llm import llm_service

router = APIRouter(prefix="/api/rag", tags=["RAG Assistant"])

@router.post("/query")
def answer_query(req: QuestionAnsweringRequest, db: Session = Depends(get_db)):
    """
    Retrieves evidence from indexed documents and answers questions with exact page-level citations.
    """
    retrieval_res = query_documents(query=req.query, top_k=req.top_k)
    
    if not retrieval_res["evidence_found"]:
        return {
            "evidence_found": False,
            "answer": "Evidence not found in indexed documents. Please upload the relevant Scheme Information Document (SID) or Mutual Fund Factsheet to verify this query.",
            "citations": [],
            "query": req.query,
            "provider_used": "deterministic_grounding_engine"
        }

    # Pass citations to LLM / Extractive Grounder
    llm_res = llm_service.answer_document_query(
        query=req.query,
        citations=retrieval_res["citations"]
    )

    return {
        "evidence_found": True,
        "answer": llm_res["answer"],
        "citations": retrieval_res["citations"],
        "query": req.query,
        "provider_used": llm_res["provider_used"]
    }
