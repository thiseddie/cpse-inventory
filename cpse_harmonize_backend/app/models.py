
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base


class CPSEOrganization(Base):
    __tablename__ = "cpse_organizations"

    cpse_id = Column(Integer, primary_key=True, index=True)
    cpse_code = Column(String(20), unique=True, nullable=False)
    cpse_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime)