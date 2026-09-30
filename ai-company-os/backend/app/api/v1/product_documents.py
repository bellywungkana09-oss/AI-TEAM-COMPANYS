import uuid
from typing import Annotated
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project,ProductDocument
router=APIRouter(prefix='/product-documents',tags=['product-builder'])
@router.post('/projects/{project_id}')
def build(project_id:uuid.UUID,idea:str,db:Annotated[Session,Depends(get_db)]):
 p=db.get(Project,project_id)
 if not p:raise HTTPException(404,'Project not found')
 docs=[]
 for typ,title,content in [('product_requirement','Product Requirement',{'overview':idea,'user_persona':['Target user'],'user_story':['Complete core journey'],'feature_list':['Core feature'],'MVP_scope':['Core feature'],'acceptance_criteria':['Testable flow']}),('design','Design Document',{'user_flow':['Discover','Act','Confirm'],'screen_list':['Landing','Core','Confirm'],'component_requirement':['Navigation','Form'],'design_direction':'Luxury accessible'}),('technical','Technical Document',{'architecture':'Next.js + FastAPI + PostgreSQL','frontend_requirement':['Responsive UI'],'backend_requirement':['REST API'],'database_requirement':['Relational schema'],'integration_requirement':['Approved integrations only']}),('qa','QA Document',{'test_strategy':['Unit','API','Acceptance'],'test_case':['Core flow'],'quality_requirement':['No critical defect']})]:
  d=ProductDocument(project_id=p.id,document_type=typ,title=title,content=content);db.add(d);docs.append(d)
 db.commit();return [{'id':str(d.id),'type':d.document_type,'title':d.title} for d in docs]
