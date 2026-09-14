from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import CPSE
router=APIRouter(prefix="/cpse",tags=["CPSE"])
@router.get("")
def list_cpse(db:Session=Depends(get_db)):
    return [{"id":x.id,"code":x.code,"name":x.name,"ministry":x.ministry,"sector":x.sector,"status":x.status} for x in db.query(CPSE).order_by(CPSE.name)]
@router.post("")
def create_cpse(data:dict,db:Session=Depends(get_db)):
    if db.query(CPSE).filter_by(code=data["code"]).first(): raise HTTPException(409,"CPSE code already exists")
    x=CPSE(**data); db.add(x); db.commit(); db.refresh(x); return {"id":x.id,"code":x.code,"name":x.name}
