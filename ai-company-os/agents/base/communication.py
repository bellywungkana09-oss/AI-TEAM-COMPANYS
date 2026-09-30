from app.models import Message
class AgentCommunicationBus:
 def __init__(self,db,registry):self.db=db;self.registry=registry
 def send_message(self,sender_key,receiver_key,message,metadata=None):
  s=self.registry.get_agent(sender_key);r=self.registry.get_agent(receiver_key);row=Message(sender_id=s.id,receiver_id=r.id,message=message,meta=metadata or {});self.db.add(row);self.db.flush();payload={'id':row.id,'sender_id':s.id,'receiver_id':r.id,'message':message,'metadata':metadata or {}};r._receive_message(payload);return payload
 def broadcast(self,sender_key,message,metadata=None):return [self.send_message(sender_key,k,message,metadata) for k in self.registry._agents if k!=sender_key]
 def receive_message(self,receiver_key):return self.registry.get_agent(receiver_key).receive_next_message()
