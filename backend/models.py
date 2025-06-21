from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, Date, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship, validates
from database import Base  # Ensure your `Base = declarative_base()` is defined in this module
from datetime import datetime


class BaseModel(Base):
    __abstract__ = True  # Prevent table creation

    @validates("area", "village")
    def validate_lowercase(self, key, value):
        return value.lower() if value else value


class Village(BaseModel):
    __tablename__ = "village"

    village_id = Column(Integer, primary_key=True, index=True)
    village = Column(String(50), unique=True, nullable=False)


class Area(BaseModel):
    __tablename__ = "area"

    area_id = Column(Integer, primary_key=True, index=True)
    area = Column(String(50), unique=True, nullable=False)

class User(BaseModel):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    usercode = Column(String(50))
    name = Column(String(100))
    surname = Column(String(100))
    father_or_husband_name = Column(String(100))
    mother_name = Column(String(100))
    gender = Column(String(10))
    birth_date = Column(Date)

    mobile_no1 = Column(String(15))
    mobile_no2 = Column(String(15))

    fk_area_id = Column(Integer, ForeignKey("area.area_id"))
    fk_village_id = Column(Integer, ForeignKey("village.village_id"))

    area = relationship("Area", backref="users")
    village = relationship("Village", backref="users")

    address = Column(String(255))
    pincode = Column(String(10))
    occupation = Column(String(100))
    country = Column(String(100))
    state = Column(String(100))
    email_id = Column(String(100))

    active_flag = Column(Boolean, default=True)
    delete_flag = Column(Boolean, default=False)
    death_flag = Column(Boolean, default=False)
    receipt_flag = Column(Boolean, default=False)

    receipt_no = Column(String(50))
    receipt_date = Column(Date)
    receipt_amt = Column(DECIMAL(10, 2))

    created_at = Column(DateTime, default=datetime.utcnow)
    modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
