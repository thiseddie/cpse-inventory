
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CPSEOrganization
from app.schemas import CPSECreate, CPSEResponse

router = APIRouter(
    prefix="/api/cpse",
    tags=["CPSE Organizations"]
)


@router.get("/", response_model=List[CPSEResponse])
def get_all_cpse(db: Session = Depends(get_db)):
    return db.query(CPSEOrganization).all()


@router.get("/{cpse_id}", response_model=CPSEResponse)
def get_cpse(cpse_id: int, db: Session = Depends(get_db)):
    cpse = db.query(CPSEOrganization).filter(
        CPSEOrganization.cpse_id == cpse_id
    ).first()

    if not cpse:
        raise HTTPException(
            status_code=404,
            detail="CPSE organization not found"
        )

    return cpse


@router.post("/", response_model=CPSEResponse, status_code=201)
def create_cpse(
    cpse_data: CPSECreate,
    db: Session = Depends(get_db)
):
    existing = db.query(CPSEOrganization).filter(
        CPSEOrganization.cpse_code == cpse_data.cpse_code
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="CPSE code already exists"
        )

    new_cpse = CPSEOrganization(
        cpse_code=cpse_data.cpse_code,
        cpse_name=cpse_data.cpse_name,
        description=cpse_data.description
    )

    db.add(new_cpse)
    db.commit()
    db.refresh(new_cpse)

    return new_cpse