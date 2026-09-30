from orchestrator.project_manager import ProjectManagerAgent
class ProjectExecutionService:
 def __init__(self,db):self.db=db;self.manager=ProjectManagerAgent()
 def plan(self,project):return self.manager.create_execution_plan(project)
