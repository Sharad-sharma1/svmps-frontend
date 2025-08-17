from fastapi import FastAPI, HTTPException, Depends, status, Query
from typing import Annotated, Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from collections import defaultdict
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from sqlalchemy import or_

import models
from database import engine, SessionLocal
from req_resp import *

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# --- Village Routes ---
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
        raise HTTPException(status_code=400, detail="Village with this name already exists")

@app.get("/village/", status_code=status.HTTP_200_OK)
async def read_village(
    db: db_dependency,
    village: Optional[str] = None,
    page_num: Optional[int] = 1
):
    from sqlalchemy import func
    
    offset = 10 * (page_num - 1)
    
    # Query with user count
    query = db.query(
        models.Village.village_id,
        models.Village.village,
        func.count(models.User.user_id).label("user_count")
    ).outerjoin(
        models.User,
        (models.Village.village_id == models.User.fk_village_id) &
        ((models.User.delete_flag == False) | (models.User.delete_flag == None))
    ).group_by(
        models.Village.village_id,
        models.Village.village
    )
    
    if village:
        query = query.filter(models.Village.village.ilike(f"%{village}%"))
    
    total_count = db.query(models.Village).count()
    result = query.order_by(models.Village.village).offset(offset).limit(10).all()
    
    return {
        "total_count": total_count,
        "page_num": page_num,
        "data": [{
            "village_id": r.village_id,
            "village": r.village,
            "user_count": r.user_count
        } for r in result]
    }
@app.delete("/village/{village_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_village(village_id: int, db: db_dependency):
    db_village = db.query(models.Village).filter(models.Village.village_id == village_id).first()
    if not db_village:
        raise HTTPException(status_code=404, detail="Village not found")
    db.delete(db_village)
    db.commit()

# --- Area Routes ---
@app.post("/area/", status_code=status.HTTP_201_CREATED)
async def create_area(area: AreaBase, db: db_dependency):
    try:
        db_area = models.Area(**area.dict())
        db.add(db_area)
        db.commit()
        db.refresh(db_area)
        return db_area
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Area with this name already exists")

@app.get("/area/", status_code=status.HTTP_200_OK)
async def read_area(
    db: db_dependency,
    area: Optional[str] = None,
    page_num: Optional[int] = 1
):
    from sqlalchemy import func
    
    offset = 10 * (page_num - 1)
    
    # Query with user count
    query = db.query(
        models.Area.area_id,
        models.Area.area,
        func.count(models.User.user_id).label("user_count")
    ).outerjoin(
        models.User, 
        (models.Area.area_id == models.User.fk_area_id) & 
        ((models.User.delete_flag == False) | (models.User.delete_flag == None))
    ).group_by(
        models.Area.area_id,
        models.Area.area
    )
    
    if area:
        query = query.filter(models.Area.area.ilike(f"%{area}%"))
    
    total_count = db.query(models.Area).count()
    result = query.order_by(models.Area.area).offset(offset).limit(10).all()
    
    return {
        "total_count": total_count, 
        "page_num": page_num, 
        "data": [{
            "area_id": r.area_id,
            "area": r.area,
            "user_count": r.user_count
        } for r in result]
    }

@app.delete("/area/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_area(area_id: int, db: db_dependency):
    db_area = db.query(models.Area).filter(models.Area.area_id == area_id).first()
    if not db_area:
        raise HTTPException(status_code=404, detail="Area not found")
    db.delete(db_area)
    db.commit()

# --- User Routes ---
@app.post("/users/", status_code=status.HTTP_201_CREATED, response_model=UserCreate)
def create_user(user: UserCreate, db: db_dependency):
    if user.fk_area_id:
        if not db.query(models.Area).filter(models.Area.area_id == user.fk_area_id).first():
            raise HTTPException(status_code=400, detail="Area ID not found")
    if user.fk_village_id:
        if not db.query(models.Village).filter(models.Village.village_id == user.fk_village_id).first():
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


# Utility: Page number for PDF
def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 10)
    canvas.drawString(270, 20, f"Page {doc.page}")
    canvas.restoreState()

@app.get("/users/", status_code=status.HTTP_200_OK)
def read_users(
    db: db_dependency,
    page_num: Optional[int] = 1,
    name: Optional[str] = Query(None),
    type_filter: Optional[List[str]] = Query(None),
    area_ids: Optional[List[int]] = Query(None),
    village_ids: Optional[List[int]] = Query(None),
    pdf: Optional[bool] = False
):
    query = db.query(models.User).options(joinedload(models.User.area), joinedload(models.User.village)).filter(models.User.delete_flag == False)

    if name:
        search = f"%{name}%"
        query = query.filter(
            or_(
                models.User.name.ilike(search),
                models.User.father_or_husband_name.ilike(search),
                models.User.mobile_no1.ilike(search),
                models.User.mobile_no2.ilike(search)
            )
        )

    if type_filter:
        query = query.filter(models.User.type.in_([t.upper() for t in type_filter]))

    if area_ids:
        query = query.filter(models.User.fk_area_id.in_(area_ids))

    if village_ids:
        query = query.filter(models.User.fk_village_id.in_(village_ids))

    if pdf:
        users = (
            query
            .join(models.Village, models.User.fk_village_id == models.Village.village_id, isouter=True)
            .join(models.Area, models.User.fk_area_id == models.Area.area_id, isouter=True)
            .options(joinedload(models.User.area), joinedload(models.User.village))
            .filter(models.User.delete_flag == False)
            .order_by(models.User.type, models.Village.village, models.User.name)
            .all()
        )

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, title="User Report")
        elements = []

        styles = getSampleStyleSheet()
        red_bold = ParagraphStyle(name='RedBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, textColor=colors.red)

        table_style = TableStyle([
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.red),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ])

        user_groups = defaultdict(list)
        for u in users:
            user_groups[u.type].append(u)

        for i, (user_type, group_users) in enumerate(user_groups.items()):
            if i > 0:
                elements.append(PageBreak())

            # Group block for this user_type
            group_block = []

            # Fake header inside content flow (looks like a canvas header)
            header_para = Paragraph(f"<b>Type: {user_type}</b>", ParagraphStyle(
                name='HeaderStyle',
                fontName='Helvetica-Bold',
                fontSize=12,
                textColor=colors.red,
                alignment=1,  # centered
                spaceAfter=10,
            ))
            group_block.append(header_para)

            rows = []
            current_row = []
            for u in group_users:
                name = f"{u.name} {u.father_or_husband_name or ''} {u.surname or ''}"
                para_text = f"""
                    TO: {u.area.area if u.area else ''}<br/>
                    <b>NAME:</b> {name}<br/>
                    <b>ADDRESS:</b> {u.address or ''}<br/>
                    <b>MOBILE:</b> {u.mobile_no1 or ''} / {u.mobile_no2 or ''}<br/>
                    <b>VILLAGE:</b> {u.village.village if u.village else ''}
                """
                para = Paragraph(para_text, red_bold)
                if len(current_row) == 2:
                    rows.append(current_row)
                    current_row = [para]
                else:
                    current_row.append(para)
            if current_row:
                rows.append(current_row)

            table = Table(rows, colWidths=[260, 260])
            table.setStyle(table_style)

            group_block.append(table)

            # Keep the whole group together to ensure the header stays on the same page
            elements.append(KeepTogether(group_block))


        doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=users_report.pdf"})

    return {
        "page_num": page_num,
        "total_count": query.count(),
        "data": [{
            "user_id": u.user_id,
            "name": u.name,
            "surname": u.surname,
            "father_or_husband_name": u.father_or_husband_name,
            "mobile_no1": u.mobile_no1,
            "mobile_no2": u.mobile_no2,
            "address": u.address,
            "state": u.state,
            "pincode": u.pincode,
            "email_id": u.email_id,
            "area": u.area.area if u.area else None,
            "village": u.village.village if u.village else None,
            "type": u.type,
            "status": u.status,
        } for u in query.join(models.Village, models.User.fk_village_id == models.Village.village_id, isouter=True).join(models.Area, models.User.fk_area_id == models.Area.area_id, isouter=True).order_by(models.User.type, models.Village.village, models.User.name).offset((page_num - 1) * 10).limit(10).all()]
    }

@app.put("/users/{user_id}", response_model=UserUpdate)
def update_user(user_id: int, updated_user: UserUpdate, db: db_dependency):
    user = db.query(models.User).filter(models.User.user_id == user_id, models.User.delete_flag == False).first()
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

@app.get("/users/stats", status_code=status.HTTP_200_OK)
def get_user_stats(db: db_dependency):
    from sqlalchemy import func
    
    # Get total count
    total_count = db.query(models.User).filter(models.User.delete_flag == False).count()
    
    # Get counts by type
    type_counts = db.query(
        models.User.type,
        func.count(models.User.user_id).label("count")
    ).filter(
        models.User.delete_flag == False
    ).group_by(models.User.type).all()
    
    # Convert to dictionary
    stats = {"total": total_count}
    for type_name, count in type_counts:
        if type_name:  # Only include non-null types
            stats[type_name.lower()] = count
    
    return stats
