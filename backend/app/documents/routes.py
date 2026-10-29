import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db, DocumentRecordModel
from ..configuration.settings import settings
from ..retrieval import extract_pdf_and_index

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    fund_house: Optional[str] = Form(None),
    scheme_name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    doc_type: str = Form("SID"), # "SID", "factsheet", "KIM", "rulebook"
    source_notes: Optional[str] = Form("Uploaded by user"),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only standard PDF documents are supported.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    clean_filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    saved_path = os.path.join(settings.UPLOAD_DIR, clean_filename)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(saved_path)

    # Create DB entry
    db_doc = DocumentRecordModel(
        title=title,
        fund_house=fund_house,
        scheme_name=scheme_name,
        category=category,
        doc_type=doc_type,
        filename=clean_filename,
        filepath=saved_path,
        file_size_bytes=file_size,
        source_notes=source_notes,
        status="pending"
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    # Run extraction & semantic indexing
    indexing_result = extract_pdf_and_index(
        filepath=saved_path,
        doc_id=db_doc.id,
        doc_name=title
    )

    if indexing_result["success"]:
        db_doc.status = "indexed"
        db_doc.total_pages = indexing_result["pages"]
        db_doc.indexed_at = datetime.utcnow()
    else:
        db_doc.status = "failed"
        db_doc.index_error = indexing_result.get("error", "Unknown indexing error")

    db.commit()
    db.refresh(db_doc)

    return {
        "id": db_doc.id,
        "title": db_doc.title,
        "status": db_doc.status,
        "pages_indexed": db_doc.total_pages,
        "chunks_indexed": indexing_result.get("chunks_count", 0),
        "error": db_doc.index_error
    }

@router.get("/")
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentRecordModel).order_by(DocumentRecordModel.created_at.desc()).all()
    return [{
        "id": d.id,
        "title": d.title,
        "fund_house": d.fund_house,
        "scheme_name": d.scheme_name,
        "category": d.category,
        "doc_type": d.doc_type,
        "filename": d.filename,
        "total_pages": d.total_pages,
        "status": d.status,
        "index_error": d.index_error,
        "source_notes": d.source_notes,
        "file_size_bytes": d.file_size_bytes,
        "created_at": d.created_at
    } for d in docs]

@router.get("/{doc_id}/view")
def view_document_pdf(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentRecordModel).filter(DocumentRecordModel.id == doc_id).first()
    if not doc or not os.path.exists(doc.filepath):
        raise HTTPException(status_code=404, detail="Document file not found on disk")
    return FileResponse(doc.filepath, media_type="application/pdf", filename=doc.filename)

@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentRecordModel).filter(DocumentRecordModel.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Try deleting physical file
    try:
        if os.path.exists(doc.filepath):
            os.remove(doc.filepath)
    except Exception:
        pass

    db.delete(doc)
    db.commit()
    return {"success": True, "message": f"Document {doc.title} removed"}
