from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import CPSE,Material,StandardMaterial,MaterialMapping
router=APIRouter(prefix="/dashboard",tags=["Dashboard"])
@router.get("/stats")
def stats(db:Session=Depends(get_db)):
    n=lambda q:q.scalar() or 0
    total=n(db.query(func.count(Material.id))); approved=n(db.query(func.count(MaterialMapping.id)).filter(MaterialMapping.status.in_(["approved","auto_matched"])))
    return {"total_cpse":n(db.query(func.count(CPSE.id))),"total_materials":total,"standard_materials":n(db.query(func.count(StandardMaterial.id))),"total_mappings":n(db.query(func.count(MaterialMapping.id))),"pending_review":n(db.query(func.count(MaterialMapping.id)).filter(MaterialMapping.status=="pending")),"approved_or_auto_matched":approved,"harmonization_rate":round(approved/total*100,2) if total else 0}

