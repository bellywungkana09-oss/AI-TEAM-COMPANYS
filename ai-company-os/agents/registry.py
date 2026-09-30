class AgentRegistry:
 def __init__(self):self._agents={}
 def register_agent(self,key,agent):
  key=key.lower()
  if key in self._agents:raise ValueError('Agent already registered')
  self._agents[key]=agent
 def get_agent(self,key):return self._agents[key.lower()]
 def list_agents(self):return list(self._agents.values())
