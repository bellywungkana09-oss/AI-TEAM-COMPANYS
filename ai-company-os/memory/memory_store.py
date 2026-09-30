from sqlalchemy import select
from app.models import Memory,MemoryType,MemoryIndex
class RelationalMemoryStore:
 def __init__(self,db):self.db=db
 def save(self,e):
  m=Memory(employee_id=e.employee_id,memory_type=MemoryType.LONG_TERM,content=e.content,meta=e.metadata or {});self.db.add(m);self.db.flush();i=MemoryIndex(memory_id=m.id,scope=e.memory_type.value,project_id=e.project_id,founder_id=e.founder_id,title=e.title,tags=list(e.tags),search_text=e.title+' '+e.content);self.db.add(i);self.db.flush();return i
 def keyword_retrieve(self,query,limit=10):return [x for x in self.db.scalars(select(MemoryIndex).order_by(MemoryIndex.created_at.desc())).all() if query.lower() in x.search_text.lower()][:limit]
