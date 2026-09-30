from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Department, Employee
from app.services.virtual_office_service import build_office_state

router = APIRouter(prefix="/virtual-office", tags=["virtual-office"])


@router.get("/state")
def state(db: Annotated[Session, Depends(get_db)]):
    people = []
    for employee in db.scalars(select(Employee).order_by(Employee.name)):
        department = db.get(Department, employee.department_id)
        people.append(
            {
                "id": str(employee.id),
                "name": employee.name,
                "role": employee.role,
                "department": department.name if department else "",
                "status": employee.status.value,
                "current_task": None,
                "skills": employee.skills or [],
            }
        )
    return build_office_state(people)
