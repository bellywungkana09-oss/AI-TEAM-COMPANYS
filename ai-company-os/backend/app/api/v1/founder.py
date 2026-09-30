import uuid
from typing import Annotated
from fastapi import APIRouter,Depends,Header,HTTPException,status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User,Project,ProjectStatus,Task,TaskPriority,Activity,Employee,Memory,MemoryType
from app.services.company_event_service import CompanyEventService
router=APIRouter(prefix='/founder',tags=['founder'])
class Command(BaseModel): command:str
@router.post('/command',status_code=status.HTTP_201_CREATED)
async def command(payload:Command,db:Annotated[Session,Depends(get_db)],x_founder_id:Annotated[str|None,Header()]=None):
 if not x_founder_id: raise HTTPException(401,'X-Founder-ID required in development')
 founder=db.get(User,uuid.UUID(x_founder_id))
 if not founder: raise HTTPException(403,'Founder not found')
 name=payload.command.strip().replace('Buat ','').title() or 'New Initiative'
 project=Project(name=name,description=payload.command,status=ProjectStatus.PLANNING,created_by=founder.id);db.add(project);db.flush()
 titles=['Product Requirements','Design Planning','Technical Architecture','Development Planning','Testing Planning']
 for t in titles: db.add(Task(project_id=project.id,title=t,priority=TaskPriority.HIGH))
 ceo=db.scalar(__import__('sqlalchemy').select(Employee).where(Employee.name=='Alexander'))
 db.add(Activity(employee_id=ceo.id if ceo else None,event_type='ceo_created_project',description=f'Alexander created project {name}.',meta={'project_id':str(project.id)}))
 if ceo: db.add(Memory(employee_id=ceo.id,memory_type=MemoryType.LONG_TERM,content=f'Founder command: {payload.command}',meta={'project_id':str(project.id)}))
 db.commit()
 strategy={'project_name':name,'objective':payload.command,'target_user':'Founder-defined target users','features':['Core workflow','Conversion flow','Contact/support'],'departments_required':['Product','Design','Technology','Quality Assurance'],'priority':'high','risk':'Requirements require Founder validation.','timeline':'4 weeks'}
 await CompanyEventService().publish_event('project_updated',{'project_id':str(project.id),'name':name,'status':'planning'})
 return {'project':name,'strategy':strategy,'tasks':[{'title':t,'description':'Initial planning task','priority':'high'} for t in titles],'status':'planning'}
