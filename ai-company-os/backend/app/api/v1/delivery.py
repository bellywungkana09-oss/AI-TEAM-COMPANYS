import uuid
from typing import Annotated
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project,DeploymentRecord
router=APIRouter(prefix='/delivery',tags=['delivery'])
@router.post('/projects/{project_id}/plan')
def delivery(project_id:uuid.UUID,db:Annotated[Session,Depends(get_db)]):
 p=db.get(Project,project_id)
 if not p:raise HTTPException(404,'Project not found')
 r=DeploymentRecord(project_id=p.id,version_label='v0.1.0',artifact_plan={'suggested_structure':['frontend/','backend/','tests/'],'permission_required':True});db.add(r);db.commit();return {'id':str(r.id),'status':r.status,'artifact_plan':r.artifact_plan}
