import json,logging,sys
from contextvars import ContextVar
from datetime import UTC,datetime
request_id_context=ContextVar("request_id",default="-")
class JsonFormatter(logging.Formatter):
 def format(self,r): return json.dumps({"timestamp":datetime.now(UTC).isoformat(),"level":r.levelname,"request_id":request_id_context.get(),"message":r.getMessage()})
def configure_logging():
 h=logging.StreamHandler(sys.stdout);h.setFormatter(JsonFormatter());root=logging.getLogger();root.handlers.clear();root.addHandler(h);root.setLevel(logging.INFO)
