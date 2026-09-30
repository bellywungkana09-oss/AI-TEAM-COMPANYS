from app.models import Employee
from agents.cto.agent import CTOAgent
def test_employee_agent(db,department):
 e=Employee(name='Marcus',role='CTO AI',department_id=department.id);db.add(e);db.commit();assert CTOAgent(db,e,'cto').name=='Marcus'
