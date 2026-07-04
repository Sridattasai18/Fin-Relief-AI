import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    loans = relationship("Loan", back_populates="owner", cascade="all, delete-orphan")
    letters = relationship("Letter", back_populates="owner", cascade="all, delete-orphan")
    snapshots = relationship("StressSnapshot", back_populates="owner", cascade="all, delete-orphan")


class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    lender = Column(String, nullable=False)
    loan_type = Column(String, default="Personal loan")
    amount = Column(Float, nullable=False)
    emi = Column(Float, nullable=False)
    overdue_days = Column(Integer, default=0)
    income = Column(Float, nullable=False)
    monthly_expenses = Column(Float, nullable=True) # User override; default 40% of income in calculations if None
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="loans")
    letters = relationship("Letter", back_populates="loan", cascade="all, delete-orphan")
    snapshots = relationship("StressSnapshot", back_populates="loan", cascade="all, delete-orphan")


class StressSnapshot(Base):
    __tablename__ = "stress_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"))
    lender = Column(String, nullable=False)
    dti_ratio = Column(Float, nullable=False)
    stress_score = Column(Float, nullable=False)
    stress_level = Column(String, nullable=False) # "Low"/"Medium"/"High"/"Critical"
    settlement_percentage = Column(Float, nullable=False)
    monthly_surplus = Column(Float, nullable=False)
    months_to_clear_debt = Column(Integer, nullable=False) # Estimated payoff time
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="snapshots")
    loan = relationship("Loan", back_populates="snapshots")


class Letter(Base):
    __tablename__ = "letters"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"))
    lender = Column(String, nullable=False)
    settlement_pct = Column(Float, nullable=False)
    letter_text = Column(String, nullable=False)
    source = Column(String, nullable=False) # "gemini" or "fallback"
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="letters")
    loan = relationship("Loan", back_populates="letters")
