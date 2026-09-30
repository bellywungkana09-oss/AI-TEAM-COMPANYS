import uuid
from typing import Annotated
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project,Task,Employee,WorkflowExecution,ProjectPhase,Activity
router=APIRouter(prefix='/execution',tags=['execution'])
@router.post('/projects/{project_id}/plan')
def plan(project_id:uuid.UUID,db:Annotated[Session,Depends(get_db)]):
 p=db.get(Project,project_id)
 if not p: raise HTTPException(404,'Project not found')
 w=WorkflowExecution(project_id=p.id,status='running',current_phase='product_requirements',state_data={}) ;db.add(w)
 for i,n in enumerate(['product_requirements','ux_design','technical_architecture','development','testing','delivery_readiness'],1):db.add(ProjectPhase(project_id=p.id,name=n,sequence=i,status='active' if i==1 else 'pending',approval_required=n in {'development','delivery_readiness'}))
 db.add(Activity(event_type='project_phase_changed',description=f'Execution plan created for {p.name}.'));db.commit();return {'workflow_id':str(w.id),'status':w.status,'current_phase':w.current_phase}
@router.post('/tasks/{task_id}/assign')
def assign(task_id:uuid.UUID,employee_id:uuid.UUID,db:Annotated[Session,Depends(get_db)]):
 t=db.get(Task,task_id);e=db.get(Employee,employee_id)
 if not t or not e:raise HTTPException(404,'Task or employee not found')
 t.employee_id=e.id;t.status='in_progress';e.status='assigned';db.add(Activity(employee_id=e.id,event_type='task_assigned',description=f'{t.title} assigned to {e.name}.'));db.commit();return {'task_id':str(t.id),'employee_id':str(e.id),'status':t.status.value}
