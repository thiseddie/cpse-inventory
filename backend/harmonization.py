from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Material,StandardMaterial,MaterialMapping
from ..services.ai_matching import similarity,normalize
router=APIRouter(prefix="/harmonization",tags=["AI Harmonization"])
@router.post("/run")
def run(threshold:float=0.82,auto_approve_threshold:float=0.95,db:Session=Depends(get_db)):
    mats=db.query(Material).all(); stds=db.query(StandardMaterial).all()
    if not stds:
        seen=set()
        for m in mats:
            k=normalize(m.description)
            if k in seen: continue
            seen.add(k); stds.append(StandardMaterial(standard_code=f"STD-{len(stds)+1:06d}",standard_name=m.description,category=m.category,unit=m.unit,specification=m.specification,reference_price=m.unit_price))
        db.add_all(stds); db.commit(); stds=db.query(StandardMaterial).all()
    created=0
    for m in mats:
        if db.query(MaterialMapping).filter_by(material_id=m.id).first(): continue
        cand=[s for s in stds if not m.category or not s.category or m.category.lower()==s.category.lower()] or stds
        best=max(((similarity(m.normalized_text,normalize(s.standard_name)),s) for s in cand),key=lambda z:z[0])
        if best[0]>=threshold:
            db.add(MaterialMapping(material_id=m.id,standard_material_id=best[1].id,similarity=best[0],status="auto_matched" if best[0]>=auto_approve_threshold else "pending")); created+=1
    db.commit(); return {"processed":len(mats),"new_mappings":created}
