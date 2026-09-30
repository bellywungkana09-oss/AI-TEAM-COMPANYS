from memory.memory_schema import MemoryEntry,AdvancedMemoryType
class MemoryExtractor:
 def classify(self,employee_id,content,**kwargs):
  x=content.lower();t=AdvancedMemoryType.EXPERIENCE if any(k in x for k in ['bug','lesson','failure']) else AdvancedMemoryType.FOUNDER_PREFERENCE if 'prefer' in x else AdvancedMemoryType.PROJECT if kwargs.get('project_id') else AdvancedMemoryType.AGENT
  return MemoryEntry(employee_id,content,t,kwargs.get('title',t.value),project_id=kwargs.get('project_id'),founder_id=kwargs.get('founder_id'))
