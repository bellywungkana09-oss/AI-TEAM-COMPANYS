from agents.base.agent import BaseAgent
from app.models import Employee,EmployeeStatus,Activity
class BaseEmployeeAgent(BaseAgent):
 def __init__(self,db,employee,registry_key):
  super().__init__(employee.name,employee.role);self.db=db;self.employee=employee;self.registry_key=registry_key;self.mailbox=[];self.initialize()
 @property
 def id(self):return self.employee.id
 @property
 def department(self):return self.employee.department.name
 @property
 def skills(self):return tuple(self.employee.skills)
 @property
 def personality(self):return self.employee.personality
 @property
 def status(self):return self.employee.status
 def receive_task(self,task):self.update_status(EmployeeStatus.ASSIGNED,reason=f'Received {task.title}');return {'task_id':str(task.id),'status':'received'}
 def analyze_task(self,task):return {'task_id':str(task.id),'role':self.role,'result':'planning_only'}
 def execute(self,task):return {'task_id':str(task.id),'result':'execution_not_enabled'}
 def generate_response(self,message,**context):return {'employee':self.name,'message':message}
 def update_status(self,new_status,reason):
  old=self.employee.status;self.employee.status=new_status;self.db.add(Activity(employee_id=self.id,event_type='employee_status_changed',description=f'{self.name}: {old.value} -> {new_status.value}',meta={'reason':reason}));self.db.flush();return self.employee
 def _receive_message(self,m):self.mailbox.append(m)
 def receive_next_message(self):return self.mailbox.pop(0) if self.mailbox else None
