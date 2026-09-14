from datetime import datetime
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import MaterialMapping
router=APIRouter(prefix="/mappings",tags=["Human Validation"])
@router.get("")
def mappings(status:str|None=None,limit:int=100,db:Session=Depends(get_db)):
    q=db.query(MaterialMapping)
    if status:q=q.filter_by(status=status)
    rows=q.order_by(MaterialMapping.similarity.asc()).limit(min(limit,1000)).all()
    return [{"id":x.id,"similarity":x.similarity,"status":x.status,"material":x.material.description,"material_code":x.material.local_material_code,"cpse_code":x.material.cpse.code,"standard_code":x.standard.standard_code,"standard_name":x.standard.standard_name} for x in rows]
@router.patch("/{mapping_id}/review")
def review(mapping_id:int,data:dict,db:Session=Depends(get_db)):
    if data.get("status") not in {"approved","rejected","pending"}: raise HTTPException(400,"Invalid status")
    x=db.get(MaterialMapping,mapping_id)
    if not x: raise HTTPException(404,"Mapping not found")
    x.status=data["status"]; x.reviewed_by=data.get("reviewer","SIH Reviewer"); x.reviewed_at=datetime.utcnow()
    db.commit(); return {"id":x.id,"status":x.status,"reviewed_by":x.reviewed_by}
