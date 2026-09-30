class SpecificationGenerator:
 def generate(self,brief):
  return {"overview":brief.problem,"user_persona":[brief.target_user],"user_story":["Complete workflow"],"feature_list":brief.core_features,"MVP_scope":brief.core_features,"acceptance_criteria":["Flow works"]}
