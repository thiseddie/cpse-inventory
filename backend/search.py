from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Material
from ..services.ai_matching import similarity,normalize
router=APIRouter(prefix="/search",tags=["AI Search"])
@router.get("/materials")
def search(q:str,limit:int=20,db:Session=Depends(get_db)):
    rows=db.query(Material).limit(5000).all(); scored=sorted(((similarity(normalize(q),x.normalized_text),x) for x in rows),reverse=True,key=lambda z:z[0])
    return [{"similarity":round(s,4),"material_id":m.id,"cpse_code":m.cpse.code,"material_code":m.local_material_code,"description":m.description,"category":m.category} for s,m in scored[:min(limit,100)]]
