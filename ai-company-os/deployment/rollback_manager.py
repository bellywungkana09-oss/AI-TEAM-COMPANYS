class RollbackManager:
 def mark_rolled_back(self,record,previous=None):record.status='rolled_back';record.previous_record_id=getattr(previous,'id',None);return record
