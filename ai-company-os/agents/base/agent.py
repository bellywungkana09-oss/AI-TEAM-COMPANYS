from abc import ABC,abstractmethod
class BaseAgent(ABC):
 def __init__(self,name,role,system_prompt=''):self.name=name;self.role=role;self.system_prompt=system_prompt;self._initialized=False
 def initialize(self):self._initialized=True
 def receive_message(self,message,**context):return {'agent':self.name,'message':message,'context':context}
 @abstractmethod
 def generate_response(self,message,**context):...
 def report(self,result):return {'agent':self.name,'role':self.role,'result':result}
