"""
Receipts Manager
Handles database operations for receipts
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, Query
from sqlalchemy import and_, or_, desc
from fastapi import HTTPException, status
from datetime import datetime
import time

from models.receipts import Receipt
from api_request_response.receipts import ReceiptCreate, ReceiptUpdate, ReceiptFilter


def get_receipt_creator_code(db_session: Session, user_id: int) -> str:
    """
    Get receipt creator code from user info
    
    Args:
        db_session: Database session
        user_id: User ID
        
    Returns:
        Creator code (e.g., 'RCA', 'RC1', 'RC2')
    """
    from models.auth import User
    from manager.auth import get_user_roles
    
    # Get user info
    user = db_session.query(User).filter(User.id == user_id).first()
    if not user:
        return f"RC{user_id}"  # fallback
    
    username = user.username
    user_roles = get_user_roles(db_session, user_id)
    
    # For admin/superadmin users
    if "admin" in user_roles or user.is_superuser:
        return "RCA"
    
    # For receipt creators - extract number from username  
    if username.startswith("receipt_creator"):
        creator_num = username.replace("receipt_creator", "")
        return f"RC{creator_num}"
    
    # Fallback for any other user (shouldn't happen in normal flow)
    import re
    numbers = re.findall(r'\d+', username)
    if numbers:
        return f"RC{numbers[-1]}"
    else:
        return f"RC{user_id}"


def create_receipt(db_session: Session, receipt_data: ReceiptCreate, user_id: int) -> Receipt:
    """
    Create new receipt in database with auto-generated receipt number
    
    Args:
        db_session: Database session
        receipt_data: Receipt data from API request
        user_id: ID of user creating the receipt
        
    Returns:
        Created Receipt object
    """
    try:
        # Step 1: Create receipt with temporary receipt_no
        new_receipt = Receipt(
            receipt_no=f"TEMP_{int(time.time())}_{user_id}",  # Unique temporary value
            receipt_date=receipt_data.receipt_date,
            donor_name=receipt_data.donor_name,
            village=receipt_data.village,
            residence=receipt_data.residence,
            mobile=receipt_data.mobile,
            relation_address=receipt_data.relation_address,
            payment_mode=receipt_data.payment_mode,
            payment_details=receipt_data.payment_details,
            donation1_purpose=receipt_data.donation1_purpose,
            donation1_amount=receipt_data.donation1_amount or 0.00,
            donation2_amount=receipt_data.donation2_amount or 0.00,
            total_amount=receipt_data.total_amount,
            total_amount_words=receipt_data.total_amount_words,
            created_by=user_id
        )
        
        # Step 2: Insert and get the auto-generated ID
        db_session.add(new_receipt)
        db_session.flush()  # This gets the ID without committing
        
        # Step 3: Generate final receipt number with creator code
        year = datetime.now().year
        creator_code = get_receipt_creator_code(db_session, user_id)
        final_receipt_no = f"{creator_code}/{year}/{new_receipt.id:04d}"
        
        # Step 4: Update the receipt number
        new_receipt.receipt_no = final_receipt_no
        
        # Step 5: Commit transaction
        db_session.commit()
        db_session.refresh(new_receipt)
        
        return new_receipt
        
    except Exception as e:
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create receipt: {str(e)}"
        )


def get_receipt_by_id(db_session: Session, receipt_id: int) -> Optional[Receipt]:
    """
    Get single receipt by ID
    
    Args:
        db_session: Database session
        receipt_id: Receipt ID
        
    Returns:
        Receipt object or None if not found
    """
    return db_session.query(Receipt).filter(Receipt.id == receipt_id).first()


def get_receipts_paginated(
    db_session: Session,
    filters: Optional[ReceiptFilter] = None,
    page_num: int = 1,
    page_size: int = 10,
    user_id: Optional[int] = None,
    user_roles: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Get receipts with pagination and filtering
    
    Args:
        db_session: Database session
        filters: Optional filters to apply
        page_num: Page number (starting from 1)
        page_size: Number of items per page
        user_id: Current user ID (for permission filtering)
        user_roles: Current user roles (for permission filtering)
        
    Returns:
        Dictionary with pagination info and receipts data
    """
    try:
        from models.auth import User
        
        # Base query for counting and filtering
        query = db_session.query(Receipt)
        
        # Apply role-based filtering
        if user_roles and "receipt_creator" in user_roles:
            # receipt_creator can only see their own receipts
            query = query.filter(Receipt.created_by == user_id)
        # admin and receipt_report_viewer can see all receipts (no additional filter)
        
        # Apply optional filters
        if filters:
            if filters.donor_name:
                # Combined search for donor name OR receipt number
                search_term = filters.donor_name
                query = query.filter(
                    or_(
                        Receipt.donor_name.ilike(f"%{search_term}%"),
                        Receipt.receipt_no.ilike(f"%{search_term}%")
                    )
                )
            if filters.village:
                # Combined search for village OR residence
                search_term = filters.village
                query = query.filter(
                    or_(
                        Receipt.village.ilike(f"%{search_term}%"),
                        Receipt.residence.ilike(f"%{search_term}%")
                    )
                )
            if filters.payment_mode:
                query = query.filter(Receipt.payment_mode == filters.payment_mode)
            if filters.donation1_purpose:
                query = query.filter(Receipt.donation1_purpose.ilike(f"%{filters.donation1_purpose}%"))
            if filters.status:
                query = query.filter(Receipt.status == filters.status)
            if filters.date_from:
                # Convert date to datetime (start of day)
                from datetime import datetime, time
                start_datetime = datetime.combine(filters.date_from, time.min)
                query = query.filter(Receipt.receipt_date >= start_datetime)
            if filters.date_to:
                # Convert date to datetime (end of day)
                from datetime import datetime, time
                end_datetime = datetime.combine(filters.date_to, time.max)
                query = query.filter(Receipt.receipt_date <= end_datetime)
            if filters.created_by and user_roles:
                # Admin and receipt_report_viewer can filter by creator
                from login.permissions import user_has_permission, Permission as Perm
                has_read_receipts = user_has_permission(user_roles, Perm.READ_RECEIPTS)
                is_admin = "admin" in user_roles
                
                if has_read_receipts or is_admin:
                    query = query.filter(Receipt.created_by == filters.created_by)
        
        # Get total count before applying pagination
        total_count = query.count()
        
        # Apply pagination and ordering
        offset = (page_num - 1) * page_size
        receipts = query.order_by(desc(Receipt.receipt_date)).offset(offset).limit(page_size).all()
        
        return {
            "total_count": total_count,
            "page_num": page_num,
            "page_size": page_size,
            "data": receipts
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch receipts: {str(e)}"
        )


def update_receipt(db_session: Session, receipt_id: int, updated_data: ReceiptUpdate, user_id: int, user_roles: List[str]) -> Receipt:
    """
    Update receipt in database
    
    Args:
        db_session: Database session
        receipt_id: Receipt ID to update
        updated_data: Updated receipt data
        user_id: Current user ID
        user_roles: Current user roles
        
    Returns:
        Updated Receipt object
    """
    try:
        # Get existing receipt
        receipt = db_session.query(Receipt).filter(Receipt.id == receipt_id).first()
        
        if not receipt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receipt not found"
            )
        
        # Check permissions
        # Ensure both values are integers for proper comparison
        current_user_id = int(user_id)
        receipt_creator_id = int(receipt.created_by)
        
        if "receipt_creator" in user_roles and receipt_creator_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own receipts"
            )
        
        # Update fields (only if provided)
        update_data = updated_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(receipt, field, value)
        
        # Update timestamp
        receipt.updated_at = datetime.now()
        
        db_session.commit()
        db_session.refresh(receipt)
        
        return receipt
        
    except HTTPException:
        raise
    except Exception as e:
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update receipt: {str(e)}"
        )


def delete_receipt(db_session: Session, receipt_id: int, user_id: int, user_roles: List[str]) -> bool:
    """
    Delete receipt by ID (actually sets status to 'cancelled')
    
    Args:
        db_session: Database session
        receipt_id: Receipt ID to delete
        user_id: Current user ID
        user_roles: Current user roles
        
    Returns:
        True if successful
    """
    try:
        # Get existing receipt
        receipt = db_session.query(Receipt).filter(Receipt.id == receipt_id).first()
        
        if not receipt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receipt not found"
            )
        
        # Check permissions
        # Ensure both values are integers for proper comparison
        current_user_id = int(user_id)
        receipt_creator_id = int(receipt.created_by)
        
        if "receipt_creator" in user_roles and receipt_creator_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own receipts"
            )
        
        # Set status to cancelled instead of actual deletion
        receipt.status = 'cancelled'
        receipt.updated_at = datetime.now()
        
        db_session.commit()
        
        return True
        
    except HTTPException:
        raise
    except Exception as e:
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete receipt: {str(e)}"
        )


def get_receipt_stats(db_session: Session, user_id: Optional[int] = None, user_roles: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Get receipt statistics
    
    Args:
        db_session: Database session  
        user_id: Current user ID
        user_roles: Current user roles
        
    Returns:
        Dictionary with statistics
    """
    try:
        # Base query
        query = db_session.query(Receipt)
        
        # Apply role-based filtering
        if user_roles and "receipt_creator" in user_roles:
            query = query.filter(Receipt.created_by == user_id)
        
        # Get basic stats
        total_receipts = query.count()
        total_amount = query.with_entities(db_session.query(Receipt.total_amount).subquery().c.total_amount).all()
        total_donation_amount = sum([float(amount[0]) for amount in total_amount if amount[0]])
        
        completed_receipts = query.filter(Receipt.status == 'completed').count()
        cancelled_receipts = query.filter(Receipt.status == 'cancelled').count()
        
        return {
            "total_receipts": total_receipts,
            "total_donation_amount": total_donation_amount,
            "completed_receipts": completed_receipts,
            "cancelled_receipts": cancelled_receipts,
            "current_year": datetime.now().year
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch receipt stats: {str(e)}"
        )


def get_receipt_creators(db_session: Session, user_id: int, user_roles: List[str]) -> List:
    """
    Get list of users who have created receipts
    
    Args:
        db_session: Database session
        user_id: Current user ID
        user_roles: Current user roles
        
    Returns:
        List of User objects who have created receipts
    """
    try:
        from models.auth import User
        
        print(f"DEBUG: get_receipt_creators - user_id={user_id}, user_roles={user_roles}")
        
        # Role-based filtering first
        allowed_roles = ["admin", "receipt_report_viewer", "receipt_creator"]
        has_allowed_role = any(role in allowed_roles for role in user_roles) if user_roles else False
        
        print(f"DEBUG: allowed_roles={allowed_roles}, has_allowed_role={has_allowed_role}")
        
        if not user_roles or not has_allowed_role:
            print(f"DEBUG: No access - user_roles={user_roles}")
            return []
        
        # First check if there are any receipts at all
        receipts_count = db_session.query(Receipt).count()
        print(f"DEBUG: Total receipts in database: {receipts_count}")
        
        if receipts_count == 0:
            print(f"DEBUG: No receipts found in database")
            return []
        
        # Base query to get users who have created receipts
        query = (
            db_session.query(User)
            .join(Receipt, User.id == Receipt.created_by)
            .filter(User.is_active == True)
            .distinct()
            .order_by(User.username)
        )
        
        print(f"DEBUG: Executing query...")
        creators = query.all()
        print(f"DEBUG: Found {len(creators)} creators: {[c.username for c in creators] if creators else 'None'}")
        
        return creators
        
    except Exception as e:
        # Instead of raising HTTPException, return empty list for graceful degradation
        print(f"ERROR in get_receipt_creators: {str(e)}")
        import traceback
        traceback.print_exc()
        return []


def get_creators_usernames(db_session: Session, creator_ids: List[int]) -> Dict[int, str]:
    """
    Get usernames for a list of creator IDs
    
    Args:
        db_session: Database session
        creator_ids: List of user IDs
        
    Returns:
        Dictionary mapping user ID to username
    """
    try:
        from models.auth import User
        
        if not creator_ids:
            return {}
        
        creators = db_session.query(User.id, User.username).filter(User.id.in_(creator_ids)).all()
        return {creator_id: username for creator_id, username in creators}
        
    except Exception:
        # Return empty dict on error - graceful fallback
        return {}


def get_users_by_role_ids(db_session: Session, role_ids: List[int]) -> List[Dict[str, Any]]:
    """
    Get users with specific role IDs for receipt reports dropdown
    
    Args:
        db_session: Database session
        role_ids: List of role IDs to filter by (e.g., [1, 5])
        
    Returns:
        List of dictionaries with user id and username
    """
    try:
        from models.auth import User, UserRole
        
        # Join query to get users with specified role IDs
        users = (
            db_session.query(User.id, User.username)
            .join(UserRole, User.id == UserRole.user_id)
            .filter(UserRole.role_id.in_(role_ids))
            .filter(User.is_active == True)
            .distinct()
            .order_by(User.username)
            .all()
        )
        
        # Convert to list of dictionaries
        result = []
        for user_id, username in users:
            result.append({
                "id": user_id,
                "username": username
            })
        
        return result
        
    except Exception as e:
        print(f"ERROR in get_users_by_role_ids: {str(e)}")
        import traceback
        traceback.print_exc()
        return []