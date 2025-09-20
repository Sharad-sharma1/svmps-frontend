"""
User Data Router
Handles HTTP requests for user data operations
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Annotated, Optional, List
from sqlalchemy.orm import Session

from database import get_db
from api_request_response.user_data import User_dataCreate, User_dataUpdate
from controller import user_data as user_data_controller

router = APIRouter()
db_dependency = Annotated[Session, Depends(get_db)]


@router.post("/user_data/", status_code=status.HTTP_201_CREATED)
def create_user_data(user_data: User_dataCreate, db: db_dependency):
    """
    API to create a new user data record.
    """
    try:
        response = user_data_controller.create_user_data_controller(user_data, db)
        return response
    except Exception as e:
        raise


@router.get("/user_data/", status_code=status.HTTP_200_OK)
def read_user_data(
    db: db_dependency,
    page_num: Optional[int] = 1,
    page_size: Optional[int] = 10,
    name: Optional[str] = Query(None),
    type_filter: Optional[List[str]] = Query(None),
    area_ids: Optional[List[int]] = Query(None),
    village_ids: Optional[List[int]] = Query(None),
    user_ids: Optional[List[int]] = Query(None),
    pdf: Optional[bool] = False,
    csv: Optional[bool] = False
):
    """
    API to get user data records with filtering and pagination.
    """
    try:
        response = user_data_controller.get_user_data_controller(
            db, page_num, page_size, name, type_filter, area_ids, village_ids, user_ids, pdf, csv
        )
        return response
    except Exception as e:
        raise


@router.put("/user_data/{user_id}", status_code=status.HTTP_200_OK)
def update_user_data(user_id: int, updated_user_data: User_dataUpdate, db: db_dependency):
    """
    API to update a user data record.
    """
    try:
        response = user_data_controller.update_user_data_controller(user_id, updated_user_data, db)
        return response
    except Exception as e:
        raise


@router.delete("/user_data/{user_id}", status_code=status.HTTP_200_OK)
def delete_user_data(user_id: int, db: db_dependency):
    """
    API to soft delete a user data record.
    """
    try:
        response = user_data_controller.delete_user_data_controller(user_id, db)
        return response
    except Exception as e:
        raise


@router.get("/user_data/stats", status_code=status.HTTP_200_OK)
def get_user_data_stats(db: db_dependency):
    """
    API to get user data statistics.
    """
    try:
        response = user_data_controller.get_user_data_stats_controller(db)
        return response
    except Exception as e:
        raise