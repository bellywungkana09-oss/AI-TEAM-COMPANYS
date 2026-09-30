from memory.memory_extractor import MemoryExtractor
from memory.memory_store import RelationalMemoryStore
from memory.retrieval import MemoryRetriever
class AdvancedMemoryManager:
 def __init__(self,db):self.store=RelationalMemoryStore(db);self.extractor=MemoryExtractor();self.retriever=MemoryRetriever(self.store)
 def save(self,e):return self.store.save(e)
 def classify_and_save(self,**kw):return self.save(self.extractor.classify(**kw))
 def retrieve(self,q,limit=10):return self.retriever.retrieve(q,limit)
