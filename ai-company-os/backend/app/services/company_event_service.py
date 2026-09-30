from app.websocket.company_events import company_connections,make_event
class CompanyEventService:
 async def publish_event(self,event_type,data): await company_connections.broadcast(make_event(event_type,data))
 async def broadcast_event(self,event): await company_connections.broadcast(event)
