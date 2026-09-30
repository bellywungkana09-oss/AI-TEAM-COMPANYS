class ProjectManagerAgent:
 def create_execution_plan(self,project):return [{'name':n,'sequence':i,'approval_required':n in ('development','delivery_readiness')} for i,n in enumerate(['product_requirements','ux_design','technical_architecture','development','testing','delivery_readiness'],1)]
