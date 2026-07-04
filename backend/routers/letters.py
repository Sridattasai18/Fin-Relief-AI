from typing import List
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Loan, User, Letter
from schemas import LetterOut, LetterUpdate
from auth import get_current_user
from utils.calculations import compute_settlement_metrics
from utils.gemini_client import generate_letter_body
from utils.pdf_generator import generate_letter_pdf

router = APIRouter(prefix="/letters", tags=["letters"])

@router.post("/{loan_id}", response_model=LetterOut, status_code=201)
def create_letter(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a new negotiation letter (via Gemini or fallback template)
    for a given loan. Tracks and increments version history.
    """
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.owner_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found."
        )

    # Recompute server-side parameters to ensure consistency
    metrics = compute_settlement_metrics(
        income=loan.income,
        emi=loan.emi,
        overdue_days=loan.overdue_days,
        amount=loan.amount,
        monthly_expenses=loan.monthly_expenses
    )
    settlement_pct = metrics["settlement_percentage"]

    # Generate letter body
    body, source = generate_letter_body(
        user_name=current_user.name,
        user_email=current_user.email,
        lender=loan.lender,
        loan_type=loan.loan_type,
        amount=loan.amount,
        emi=loan.emi,
        overdue_days=loan.overdue_days,
        settlement_pct=settlement_pct
    )

    # Version tracking: Find the latest version of this letter
    max_ver = db.query(func.max(Letter.version)).filter(
        Letter.loan_id == loan_id,
        Letter.owner_id == current_user.id
    ).scalar()
    
    new_version = (max_ver or 0) + 1

    letter = Letter(
        owner_id=current_user.id,
        loan_id=loan.id,
        lender=loan.lender,
        settlement_pct=settlement_pct,
        letter_text=body,
        source=source,
        version=new_version
    )
    db.add(letter)
    db.commit()
    db.refresh(letter)
    return letter

@router.get("", response_model=List[LetterOut])
def list_latest_letters_for_all_loans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the latest version of letters generated for each of the user's loans.
    Used by dashboard and history tables.
    """
    subquery = db.query(
        Letter.loan_id,
        func.max(Letter.version).label("max_version")
    ).filter(Letter.owner_id == current_user.id).group_by(Letter.loan_id).subquery()

    return db.query(Letter).join(
        subquery,
        (Letter.loan_id == subquery.c.loan_id) & (Letter.version == subquery.c.max_version)
    ).order_by(Letter.created_at.desc()).all()

@router.get("/{loan_id}", response_model=LetterOut)
def get_latest_letter_for_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the latest version of the letter for a specific loan."""
    letter = db.query(Letter).filter(
        Letter.loan_id == loan_id,
        Letter.owner_id == current_user.id
    ).order_by(Letter.version.desc()).first()

    if not letter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No negotiation letters found for this loan."
        )
    return letter

@router.get("/{loan_id}/history", response_model=List[LetterOut])
def get_letter_version_history(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all versions of negotiation letters generated for a specific loan."""
    # Validate loan ownership
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.owner_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found."
        )
    return db.query(Letter).filter(
        Letter.loan_id == loan_id,
        Letter.owner_id == current_user.id
    ).order_by(Letter.version.desc()).all()

@router.get("/download/{letter_id}")
def download_letter_pdf(
    letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates and streams a professional ReportLab PDF of the target letter."""
    letter_obj = db.query(Letter).filter(
        Letter.id == letter_id,
        Letter.owner_id == current_user.id
    ).first()

    if not letter_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Letter not found."
        )

    # Generate PDF buffer
    pdf_buffer = generate_letter_pdf(
        borrower_name=current_user.name,
        borrower_email=current_user.email,
        lender_name=letter_obj.lender,
        letter_text=letter_obj.letter_text
    )

    filename = f"negotiation-letter-{letter_obj.lender.replace(' ', '_')}.pdf"
    # Quote filename for standard headers
    safe_filename = urllib.parse.quote(filename)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{safe_filename}"
        }
    )

@router.put("/{letter_id}", response_model=LetterOut)
def update_letter_text(
    letter_id: int,
    payload: LetterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the text content of a generated negotiation letter.
    Ensures PDF exports use the edited text.
    """
    letter = db.query(Letter).filter(
        Letter.id == letter_id,
        Letter.owner_id == current_user.id
    ).first()
    if not letter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Letter not found."
        )
    letter.letter_text = payload.letter_text
    db.commit()
    db.refresh(letter)
    return letter
