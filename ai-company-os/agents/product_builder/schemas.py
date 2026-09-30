from pydantic import BaseModel
class ProductBrief(BaseModel): name:str;problem:str;target_user:str;business_goal:str;core_features:list[str];success_metric:list[str]
class ProductRequirementDocument(BaseModel): overview:str;user_persona:list[str];user_story:list[str];feature_list:list[str];MVP_scope:list[str];acceptance_criteria:list[str]
class DesignDocument(BaseModel): user_flow:list[str];screen_list:list[str];component_requirement:list[str];design_direction:str
class TechnicalDocument(BaseModel): architecture:str;frontend_requirement:list[str];backend_requirement:list[str];database_requirement:list[str];integration_requirement:list[str]
class QADocument(BaseModel): test_strategy:list[str];test_case:list[str];quality_requirement:list[str]
