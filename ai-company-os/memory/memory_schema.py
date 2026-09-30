from dataclasses import dataclass
from enum import StrEnum
class AdvancedMemoryType(StrEnum): AGENT='agent';PROJECT='project';EXPERIENCE='experience';FOUNDER_PREFERENCE='founder_preference'
@dataclass
class MemoryEntry: employee_id:object;content:str;memory_type:AdvancedMemoryType;title:str;tags:tuple=();project_id:object|None=None;founder_id:object|None=None;metadata:dict|None=None
