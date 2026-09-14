import io
import pandas as pd
from fastapi import APIRouter,Depends,UploadFile,File,HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import CPSE,Material
from ..services.ai_matching import make_text
router=APIRouter(prefix="/materials",tags=["Materials"])
def add_row(r,cpse,db):
    x=Material(cpse_id=cpse.id,local_material_code=str(r["local_material_code"]),description=str(r["description"]),
      category=str(r.get("category","")) or None,unit=str(r.get("unit","")) or None,manufacturer=str(r.get("manufacturer","")) or None,
      part_number=str(r.get("part_number","")) or None,specification=str(r.get("specification","")) or None,
      quantity=float(r.get("quantity",0) or 0),unit_price=float(r.get("unit_price",0) or 0),location=str(r.get("location","")) or None)
    x.normalized_text=make_text(x.description,x.category,x.unit,x.manufacturer,x.part_number,x.specification); db.add(x)
@router.get("")
def list_materials(limit:int=100,db:Session=Depends(get_db)):
    rows=db.query(Material).order_by(Material.id.desc()).limit(min(limit,1000)).all()
    return [{"id":x.id,"cpse_code":x.cpse.code,"material_code":x.local_material_code,"description":x.description,"category":x.category,"unit":x.unit,"quantity":x.quantity,"unit_price":x.unit_price} for x in rows]
@router.post("/upload")
async def upload(cpse_code:str,file:UploadFile=File(...),db:Session=Depends(get_db)):
    cpse=db.query(CPSE).filter_by(code=cpse_code).first()
    if not cpse: raise HTTPException(404,"CPSE not found")
    raw=await file.read(); name=file.filename.lower()
    if name.endswith(".csv"): df=pd.read_csv(io.BytesIO(raw))
    elif name.endswith((".xlsx",".xls")):
        xl=pd.ExcelFile(io.BytesIO(raw)); sheet="Material_Master" if "Material_Master" in xl.sheet_names else xl.sheet_names[0]
        df=pd.read_excel(io.BytesIO(raw),sheet_name=sheet)
    else: raise HTTPException(400,"Upload CSV or Excel")
    aliases={"code":"local_material_code","material code":"local_material_code","material_code":"local_material_code","material description":"description","material_description":"description","description":"description","part number":"part_number","unit price":"unit_price"}
    df.columns=[str(c).strip().lower() for c in df.columns]; df=df.rename(columns={c:aliases.get(c,c) for c in df.columns})
    if not {"local_material_code","description"}.issubset(df.columns): raise HTTPException(400,"Missing material_code/code or description")
    for _,r in df.fillna("").iterrows(): add_row(r,cpse,db)
    db.commit(); return {"created":len(df),"cpse_code":cpse_code,"filename":file.filename}
