class TaskAssignmentEngine:
 def find_best_employee(self,employees,required_skills):
  scored=[(len(set(map(str.lower,e.skills))&set(map(str.lower,required_skills))),e) for e in employees if e.status.value in ('idle','completed')]
  return max(scored,key=lambda x:x[0])[1] if scored and max(scored,key=lambda x:x[0])[0]>0 else None
 def validate_assignment(self,employee,required_skills):
  if not set(map(str.lower,employee.skills))&set(map(str.lower,required_skills)):raise ValueError('Skill mismatch')
 def assign_task(self,task,employee,required_skills):self.validate_assignment(employee,required_skills);task.employee_id=employee.id;task.status='in_progress';return task
