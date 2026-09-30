from typing import Annotated
from fastapi import APIRouter,Depends
from sqlalchemy import select,func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Employee,Project,Task,Activity,Department,TaskStatus
router=APIRouter(prefix='/company',tags=['company'])
@router.get('/status')
def status(db:Annotated[Session,Depends(get_db)]):
 return {'employees_total':db.scalar(select(func.count(Employee.id))) or 0,'projects_total':db.scalar(select(func.count(Project.id))) or 0,'active_projects':db.scalar(select(func.count(Project.id)).where(Project.status.in_(['planning','development','testing']))) or 0,'active_tasks':db.scalar(select(func.count(Task.id)).where(Task.status.in_([TaskStatus.IN_PROGRESS,TaskStatus.REVIEW]))) or 0,'activities_today':db.scalar(select(func.count(Activity.id))) or 0,'system_status':'online'}
@router.get('/projects')
def projects(db:Annotated[Session,Depends(get_db)]): return [{'id':str(x.id),'name':x.name,'status':x.status.value,'progress':x.progress,'created_at':x.created_at} for x in db.scalars(select(Project).order_by(Project.created_at.desc()))]
@router.get('/tasks')
def tasks(db:Annotated[Session,Depends(get_db)],project_id:str|None=None,status:str|None=None,priority:str|None=None):
 q=select(Task)
 if project_id:q=q.where(Task.project_id==project_id)
 if status:q=q.where(Task.status==status)
 if priority:q=q.where(Task.priority==priority)
 out=[]
 for x in db.scalars(q):
  e=db.get(Employee,x.employee_id) if x.employee_id else None
  out.append({'id':str(x.id),'project_id':str(x.project_id),'title':x.title,'status':x.status.value,'priority':x.priority.value,'progress':x.progress,'employee_id':str(x.employee_id) if x.employee_id else None,'assigned_employee':e.name if e else None,'created_at':x.created_at})
 return out
@router.get('/employees')
def employees(db:Annotated[Session,Depends(get_db)]):
 return [{'id':str(e.id),'name':e.name,'role':e.role,'department':db.get(Department,e.department_id).name,'status':e.status.value,'current_task':None} for e in db.scalars(select(Employee).order_by(Employee.name))]
@router.get('/activity')
def activity(db:Annotated[Session,Depends(get_db)]): return [{'id':str(x.id),'event':x.event_type,'description':x.description,'timestamp':x.created_at} for x in db.scalars(select(Activity).order_by(Activity.created_at.desc()))]
