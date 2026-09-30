import uuid,time,logging
from contextlib import asynccontextmanager
from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.core.logging import configure_logging,request_id_context
from app.api.v1 import api_router
from app.websocket.company_events import router as ws_router
configure_logging();settings=get_settings()
@asynccontextmanager
async def lifespan(app):
 logging.getLogger(__name__).info('startup');yield;logging.getLogger(__name__).info('shutdown')
def create_app():
 app=FastAPI(title=settings.app_name,version=settings.app_version,lifespan=lifespan)
 app.add_middleware(CORSMiddleware,allow_origins=settings.cors_origin_list,allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
 @app.middleware('http')
 async def request_context(req:Request,call_next):
  rid=req.headers.get('X-Request-ID',str(uuid.uuid4()));tok=request_id_context.set(rid)
  try:r=await call_next(req)
  finally:request_id_context.reset(tok)
  r.headers['X-Request-ID']=rid;return r
 @app.exception_handler(Exception)
 async def err(req,exc): return JSONResponse(status_code=500,content={'error':{'code':'internal_server_error','message':'An unexpected error occurred.','request_id':getattr(req.state,'request_id','-')}})
 app.include_router(api_router,prefix='/api/v1');app.include_router(ws_router);return app
app=create_app()
