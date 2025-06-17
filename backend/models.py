from sqlalchemy.orm import validates
from sqlalchemy import Column, Integer, String
from database import Base

class BaseModel(Base):
    __abstract__ = True  # This prevents a table from being created for this class

    @validates('area', 'village')  # This will apply to both fields in subclasses
    def validate_lowercase(self, key, value):
        return value.lower() if value else value

class Village(BaseModel):
    __tablename__ = "village"

    village_id = Column(Integer, primary_key=True, index=True)
    village = Column(String(50), unique=True)

class Area(BaseModel):
    __tablename__ = "area"

    area_id = Column(Integer, primary_key=True, index=True)
    area = Column(String(50), unique=True)
