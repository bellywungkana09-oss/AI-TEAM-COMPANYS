class BuildManager:
 def validate_project_structure(self,paths):
  missing={'frontend/','backend/','tests/'}-set(paths);return {'passed':not missing,'missing':sorted(missing),'executed':False}
