
from typing import Optional
from pydantic import BaseModel


class CPSEBase(BaseModel):
    cpse_code: str
    cpse_name: str
    description: Optional[str] = None


class CPSECreate(CPSEBase):
    pass


class CPSEResponse(CPSEBase):
    cpse_id: int

    class Config:
        orm_mode = True
