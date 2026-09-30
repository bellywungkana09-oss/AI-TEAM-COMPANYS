class MemoryRetriever:
 def __init__(self,store,vector_store=None):self.store=store;self.vector_store=vector_store
 def retrieve(self,query,limit=10):return self.store.keyword_retrieve(query,limit)
