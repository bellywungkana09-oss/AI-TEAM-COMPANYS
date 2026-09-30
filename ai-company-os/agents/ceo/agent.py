from agents.base.agent import BaseAgent
class CEOAgent(BaseAgent):
 def __init__(self):super().__init__('Alexander','CEO AI','Strategic CEO');self.initialize()
 def generate_response(self,message,**context):return {'strategy':'structured planning','command':message}
