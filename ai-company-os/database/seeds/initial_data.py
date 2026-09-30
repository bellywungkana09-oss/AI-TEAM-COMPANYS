import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'backend'))
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models import Department,Employee,User
DEPTS=['Executive','Technology','Product','Design','Marketing','Quality Assurance']
PEOPLE=[('Alexander','CEO AI','Executive',['strategy','leadership'],'ceo'),('Marcus','CTO AI','Technology',['software architecture','technical planning','technology decision'],'cto'),('Olivia','Product Manager AI','Product',['requirement analysis','user story','product planning'],'product'),('Sophia','UI/UX Designer AI','Design',['ui design','ux flow','design system'],'designer'),('David','Software Engineer AI','Technology',['frontend development','backend development','debugging'],'developer'),('Emma','Quality Assurance AI','Quality Assurance',['testing','bug analysis','quality review'],'qa'),('Emily','CMO AI','Marketing',['marketing','branding'],'cmo')]
def main():
 with SessionLocal() as db:
  d={}
  for n in DEPTS:
   x=db.scalar(select(Department).where(Department.name==n))
   if not x:x=Department(name=n,description=n);db.add(x);db.flush()
   d[n]=x
  if not db.scalar(select(User).where(User.email=='founder@example.com')):db.add(User(email='founder@example.com',name='Founder'))
  for n,r,dep,skills,key in PEOPLE:
   x=db.scalar(select(Employee).where(Employee.name==n))
   if not x:x=Employee(name=n,role=r,department_id=d[dep].id);db.add(x)
   x.role=r;x.department_id=d[dep].id;x.skills=skills;x.personality={'style':'professional'};x.employee_profile={'title':r};x.agent_config={'registry_key':key,'execution_enabled':False};x.skill_definition={s:'expert' for s in skills}
  db.commit()
if __name__=='__main__':main()
