import asyncio,uuid
from datetime import UTC,datetime
from fastapi import APIRouter,WebSocket,WebSocketDisconnect
router=APIRouter()
class CompanyConnectionManager:
 def __init__(self): self.connections=set();self.lock=asyncio.Lock()
 async def connect(self,ws):
  await ws.accept()
  async with self.lock:self.connections.add(ws)
 async def disconnect(self,ws):
  async with self.lock:self.connections.discard(ws)
 async def broadcast(self,event):
  for ws in list(self.connections):
   try: await ws.send_json(event)
   except Exception: await self.disconnect(ws)
company_connections=CompanyConnectionManager()
def make_event(t,data): return {"id":str(uuid.uuid4()),"type":t,"occurred_at":datetime.now(UTC).isoformat(),"data":data}
@router.websocket('/ws/company')
async def company_events(ws:WebSocket):
 await company_connections.connect(ws)
 try:
  await ws.send_json(make_event('company_status_changed',{'connection':'established'}))
  while True: await ws.receive_text()
 except WebSocketDisconnect: await company_connections.disconnect(ws)
