from datetime import datetime
from sqlalchemy import String,Text,Integer,Float,DateTime,ForeignKey,JSON
from sqlalchemy.orm import Mapped,mapped_column,relationship
from .database import Base
class CPSE(Base):
    __tablename__="cpse"; id:Mapped[int]=mapped_column(primary_key=True)
    code:Mapped[str]=mapped_column(String(50),unique=True,index=True)
    name:Mapped[str]=mapped_column(String(255)); ministry:Mapped[str|None]=mapped_column(String(255),nullable=True)
    sector:Mapped[str|None]=mapped_column(String(255),nullable=True); status:Mapped[str]=mapped_column(String(40),default="Active")
    materials=relationship("Material",back_populates="cpse")
class Material(Base):
    __tablename__="material"; id:Mapped[int]=mapped_column(primary_key=True)
    cpse_id:Mapped[int]=mapped_column(ForeignKey("cpse.id"),index=True)
    local_material_code:Mapped[str]=mapped_column(String(120),index=True); description:Mapped[str]=mapped_column(Text)
    category:Mapped[str|None]=mapped_column(String(150),nullable=True); unit:Mapped[str|None]=mapped_column(String(50),nullable=True)
    manufacturer:Mapped[str|None]=mapped_column(String(200),nullable=True); part_number:Mapped[str|None]=mapped_column(String(150),nullable=True)
    specification:Mapped[str|None]=mapped_column(Text,nullable=True); quantity:Mapped[float]=mapped_column(Float,default=0)
    unit_price:Mapped[float]=mapped_column(Float,default=0); location:Mapped[str|None]=mapped_column(String(150),nullable=True)
    normalized_text:Mapped[str]=mapped_column(Text,default=""); attributes:Mapped[dict]=mapped_column(JSON,default=dict)
    cpse=relationship("CPSE",back_populates="materials"); mappings=relationship("MaterialMapping",back_populates="material",cascade="all, delete-orphan")
class StandardMaterial(Base):
    __tablename__="standard_material"; id:Mapped[int]=mapped_column(primary_key=True)
    standard_code:Mapped[str]=mapped_column(String(120),unique=True,index=True); standard_name:Mapped[str]=mapped_column(Text)
    category:Mapped[str|None]=mapped_column(String(150),nullable=True); unit:Mapped[str|None]=mapped_column(String(50),nullable=True)
    specification:Mapped[str|None]=mapped_column(Text,nullable=True); reference_price:Mapped[float]=mapped_column(Float,default=0)
    mappings=relationship("MaterialMapping",back_populates="standard")
class MaterialMapping(Base):
    __tablename__="material_mapping"; id:Mapped[int]=mapped_column(primary_key=True)
    material_id:Mapped[int]=mapped_column(ForeignKey("material.id"),index=True); standard_material_id:Mapped[int]=mapped_column(ForeignKey("standard_material.id"),index=True)
    similarity:Mapped[float]=mapped_column(Float); status:Mapped[str]=mapped_column(String(40),default="pending")
    reviewed_by:Mapped[str|None]=mapped_column(String(120),nullable=True); reviewed_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)
    material=relationship("Material",back_populates="mappings"); standard=relationship("StandardMaterial",back_populates="mappings")
