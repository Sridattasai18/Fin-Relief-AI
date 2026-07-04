from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Loan, User
from schemas import LoanCreate, LoanPatch, LoanOut
from auth import get_current_user

router = APIRouter(prefix="/loans", tags=["loans"])

@router.get("", response_model=List[LoanOut])
def list_loans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Loan).filter(Loan.owner_id == current_user.id).all()

@router.post("", response_model=LoanOut, status_code=201)
def create_loan(
    payload: LoanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = Loan(owner_id=current_user.id, **payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan

@router.get("/{loan_id}", response_model=LoanOut)
def get_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.owner_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found."
        )
    return loan

@router.patch("/{loan_id}", response_model=LoanOut)
def update_loan(
    loan_id: int,
    payload: LoanPatch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.owner_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found."
        )
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(loan, field, value)
        
    db.commit()
    db.refresh(loan)
    return loan

@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.owner_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found."
        )
    db.delete(loan)
    db.commit()
    return None
