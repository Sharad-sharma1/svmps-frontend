from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine, SessionLocal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
models.Base.metadata.create_all(bind=engine)

class VillageBase(BaseModel):
    village: str

class AreaBase(BaseModel):
    area: str

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# Route: Create Village
@app.post("/village/", status_code=status.HTTP_201_CREATED)
async def create_village(village: VillageBase, db: db_dependency):
    try:
        db_village = models.Village(**village.dict())
        db.add(db_village)
        db.commit()
        db.refresh(db_village)
        return db_village
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Village with this name already exists"
        )

@app.get("/village/", status_code=status.HTTP_200_OK)
async def read_village(db: db_dependency, village: Optional[str] = None, page_num: Optional[int] = 1):
    offset = 10 * (page_num - 1)
    query = db.query(models.Village)
    if village is not None:
        query = query.filter(models.Village.village == village)
    village = query.offset(offset).limit(10).all()
    response_body = {"total_count": len(query.all()), "page_num": page_num, "data": village}
    if response_body is None:
        raise HTTPException(status_code=404, detail="Village not found")
    return response_body

# Route: Create Village
@app.post("/area/", status_code=status.HTTP_201_CREATED)
async def create_area(area: AreaBase, db: db_dependency):
    try:
        db_area = (models.Area(**area.dict()))
        db.add(db_area)
        db.commit()
        db.refresh(db_area)
        return db_area
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Area with this name already exists"
        )
    

@app.get("/area/", status_code=status.HTTP_200_OK)
async def read_area(db: db_dependency, area: Optional[str] = None, page_num: Optional[int] = 1):
    offset = 10 * (page_num - 1)
    query = db.query(models.Area)
    if area is not None:
        query = query.filter(models.Area.area == area)
    area = query.offset(offset).limit(10).all()
    response_body = {"total_count": len(query.all()), "page_num": page_num, "data": area}
    if response_body is None:
        raise HTTPException(status_code=404, detail="Area not found")
    return response_body

@app.delete("/village/{village_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_village(village_id: int, db: db_dependency):
    db_village = db.query(models.Village).filter(models.Village.village_id == village_id).first()
    if db_village is None:
        raise HTTPException(status_code=404, detail="Village not found")
    db.delete(db_village)
    db.commit()

@app.delete("/area/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_area(area_id: int, db: db_dependency):
    db_area = db.query(models.Area).filter(models.Area.area_id == area_id).first()
    if db_area is None:
        raise HTTPException(status_code=404, detail="Area not found")
    db.delete(db_area)
    db.commit()