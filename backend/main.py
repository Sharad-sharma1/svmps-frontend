from fastapi import FastAPI, HTTPException, Depends, status
from typing import Annotated, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from req_resp import *
import models
from database import engine, SessionLocal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sharad-sharma1.github.io",
        "http://localhost:5173",
        "http://localhost:3000",  # optional: for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables on startup
models.Base.metadata.create_all(bind=engine)

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
async def read_village(
    db: db_dependency,
    village: Optional[str] = None,
    page_num: Optional[int] = 1
):
    offset = 10 * (page_num - 1)
    query = db.query(models.Village)
    if village:
        query = query.filter(models.Village.village.ilike(f"%{village}%"))
    total_count = query.count()
    result = query.offset(offset).limit(10).all()

    return {
        "total_count": total_count,
        "page_num": page_num,
        "data": result
    }


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
async def read_area(
    db: db_dependency,
    area: Optional[str] = None,
    page_num: Optional[int] = 1
):
    offset = 10 * (page_num - 1)
    query = db.query(models.Area)
    if area:
        query = query.filter(models.Area.area.ilike(f"%{area}%"))
    total_count = query.count()
    result = query.offset(offset).limit(10).all()

    return {
        "total_count": total_count,
        "page_num": page_num,
        "data": result
    }

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
    

@app.post("/users/", status_code=status.HTTP_201_CREATED, response_model=UserCreate)
def create_user(user: UserCreate, db: db_dependency):
    if user.fk_area_id:
        area = db.query(models.Area).filter(models.Area.area_id == user.fk_area_id).first()
        if not area:
            raise HTTPException(status_code=400, detail="Area ID not found")

    if user.fk_village_id:
        village = db.query(models.Village).filter(models.Village.village_id == user.fk_village_id).first()
        if not village:
            raise HTTPException(status_code=400, detail="Village ID not found")

    try:
        db_user = models.User(**user.dict())
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Integrity error while creating user")

from sqlalchemy import or_
from typing import List, Optional
from fastapi import Query

@app.get("/users/", status_code=status.HTTP_200_OK)
def read_users(
    db: db_dependency,
    page_num: Optional[int] = 1,
    name: Optional[str] = Query(None, description="Search by user name, area, or village"),
    type_filter: Optional[List[str]] = Query(None, description="Filter by user types (e.g., NRS, ALL, etc.)"),
    area_ids: Optional[List[int]] = Query(None, description="Filter by multiple area IDs"),
    village_ids: Optional[List[int]] = Query(None, description="Filter by multiple village IDs")
):
    offset = 10 * (page_num - 1)
    query = db.query(models.User).filter(models.User.delete_flag == False)

    if name:
        query = query.join(models.Area, isouter=True).join(models.Village, isouter=True)
        search = f"%{name}%"
        query = query.filter(
            or_(
                models.User.name.ilike(search),
                models.Area.area.ilike(search),
                models.Village.village.ilike(search)
            )
        )

    if type_filter:
        query = query.filter(models.User.type.in_([t.upper() for t in type_filter]))

    if area_ids:
        query = query.filter(models.User.fk_area_id.in_(area_ids))

    if village_ids:
        query = query.filter(models.User.fk_village_id.in_(village_ids))

    total_count = query.count()
    users = query.order_by(models.User.created_at.desc()).offset(offset).limit(10).all()


    if not users:
        raise HTTPException(status_code=404, detail="Users not found")

    response_body = {
        "total_count": total_count,
        "page_num": page_num,
        "data": [
            {
                "user_id": u.user_id,
                "usercode": u.usercode,
                "name": u.name,
                "surname": u.surname,
                "father_or_husband_name": u.father_or_husband_name,
                "mother_name": u.mother_name,
                "gender": u.gender,
                "birth_date": u.birth_date,
                "mobile_no1": u.mobile_no1,
                "mobile_no2": u.mobile_no2,
                "address": u.address,
                "pincode": u.pincode,
                "occupation": u.occupation,
                "country": u.country,
                "state": u.state,
                "email_id": u.email_id,
                "area": u.area.area if u.area else None,
                "village": u.village.village if u.village else None,
                "status": u.status,
                "type": u.type,
            }
            for u in users
        ]
    }

    return response_body





from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

@app.put("/users/{user_id}", response_model=UserUpdate)
def update_user(user_id: int, updated_user: UserUpdate, db: db_dependency):
    print("Received update payload:", updated_user.dict(exclude_unset=True))

    user = db.query(models.User).filter(
        models.User.user_id == user_id,
        models.User.delete_flag == False
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        for key, value in updated_user.dict(exclude_unset=True).items():
            setattr(user, key, value)

        db.commit()
        db.refresh(user)
        return updated_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Integrity error while updating user")



@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: db_dependency):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.delete_flag = True
    db.commit()