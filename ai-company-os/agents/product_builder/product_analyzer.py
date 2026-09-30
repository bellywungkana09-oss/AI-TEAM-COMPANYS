from agents.product_builder.schemas import ProductBrief
class ProductAnalyzer:
 def analyze(self,idea):return ProductBrief(name=idea.title(),problem=idea,target_user='Target users',business_goal='Validate MVP',core_features=['Core workflow','Conversion','Support'],success_metric=['Conversion rate'])
