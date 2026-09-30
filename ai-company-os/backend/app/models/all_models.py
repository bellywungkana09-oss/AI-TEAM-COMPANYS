import uuid
from enum import StrEnum
from typing import Any
from sqlalchemy import String,Text,Integer,ForeignKey,Uuid,CheckConstraint,Float
from sqlalchemy.orm import Mapped,mapped_column,relationship
from app.models.base import Base,UUIDPrimaryKeyMixin,TimestampMixin,CreatedAtMixin,JSONType,enum_type
class UserRole(StrEnum): FOUNDER="founder"
class EmployeeStatus(StrEnum): IDLE="idle";ASSIGNED="assigned";WORKING="working";MEETING="meeting";REVIEW="review";COMPLETED="completed";FAILED="failed"
class ProjectStatus(StrEnum): CREATED="created";PLANNING="planning";DEVELOPMENT="development";TESTING="testing";COMPLETED="completed"
class TaskPriority(StrEnum): LOW="low";MEDIUM="medium";HIGH="high";CRITICAL="critical"
class TaskStatus(StrEnum): TODO="todo";IN_PROGRESS="in_progress";REVIEW="review";DONE="done";BLOCKED="blocked"
class ApprovalStatus(StrEnum): PENDING="pending";APPROVED="approved";REJECTED="rejected"
class MemoryType(StrEnum): SHORT_TERM="short_term";LONG_TERM="long_term";EXPERIENCE="experience"
class User(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="users";email:Mapped[str]=mapped_column(String(255),unique=True);name:Mapped[str]=mapped_column(String(120));role:Mapped[UserRole]=mapped_column(enum_type(UserRole,"user_role"),default=UserRole.FOUNDER)
class Department(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="departments";name:Mapped[str]=mapped_column(String(80),unique=True);description:Mapped[str|None]=mapped_column(Text);employees=relationship("Employee",back_populates="department")
class Employee(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="employees";department_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("departments.id"));name:Mapped[str]=mapped_column(String(120));role:Mapped[str]=mapped_column(String(80));personality:Mapped[dict]=mapped_column(JSONType,default=dict);skills:Mapped[list]=mapped_column(JSONType,default=list);employee_profile:Mapped[dict]=mapped_column(JSONType,default=dict);agent_config:Mapped[dict]=mapped_column(JSONType,default=dict);skill_definition:Mapped[dict]=mapped_column(JSONType,default=dict);status:Mapped[EmployeeStatus]=mapped_column(enum_type(EmployeeStatus,"employee_status"),default=EmployeeStatus.IDLE);department=relationship("Department",back_populates="employees")
class Project(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="projects";name:Mapped[str]=mapped_column(String(200));description:Mapped[str|None]=mapped_column(Text);status:Mapped[ProjectStatus]=mapped_column(enum_type(ProjectStatus,"project_status"),default=ProjectStatus.CREATED);progress:Mapped[int]=mapped_column(Integer,default=0);created_by:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("users.id"))
class Task(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="tasks";project_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("projects.id"));employee_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("employees.id"));title:Mapped[str]=mapped_column(String(200));description:Mapped[str|None]=mapped_column(Text);priority:Mapped[TaskPriority]=mapped_column(enum_type(TaskPriority,"task_priority"),default=TaskPriority.MEDIUM);status:Mapped[TaskStatus]=mapped_column(enum_type(TaskStatus,"task_status"),default=TaskStatus.TODO);progress:Mapped[int]=mapped_column(Integer,default=0)
class Activity(UUIDPrimaryKeyMixin,CreatedAtMixin,Base):
 __tablename__="activities";employee_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("employees.id"));event_type:Mapped[str]=mapped_column(String(80));description:Mapped[str]=mapped_column(Text);meta:Mapped[dict]=mapped_column("metadata",JSONType,default=dict)
class Message(UUIDPrimaryKeyMixin,CreatedAtMixin,Base):
 __tablename__="messages";sender_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("employees.id"));receiver_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("employees.id"));message:Mapped[str]=mapped_column(Text);meta:Mapped[dict]=mapped_column("metadata",JSONType,default=dict)
class Memory(UUIDPrimaryKeyMixin,CreatedAtMixin,Base):
 __tablename__="memories";employee_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("employees.id"));memory_type:Mapped[MemoryType]=mapped_column(enum_type(MemoryType,"memory_type"),default=MemoryType.LONG_TERM);content:Mapped[str]=mapped_column(Text);meta:Mapped[dict]=mapped_column("metadata",JSONType,default=dict)
class Approval(UUIDPrimaryKeyMixin,CreatedAtMixin,Base):
 __tablename__="approvals";project_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("projects.id"));request:Mapped[str]=mapped_column(Text);status:Mapped[ApprovalStatus]=mapped_column(enum_type(ApprovalStatus,"approval_status"),default=ApprovalStatus.PENDING);approved_by:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("users.id"))
class WorkflowExecution(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="workflow_executions";project_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("projects.id"));workflow_name:Mapped[str]=mapped_column(String(120),default="project_execution");status:Mapped[str]=mapped_column(String(40),default="created");current_phase:Mapped[str|None]=mapped_column(String(80));state_data:Mapped[dict]=mapped_column(JSONType,default=dict)
class ProjectPhase(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="project_phases";project_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("projects.id"));name:Mapped[str]=mapped_column(String(80));sequence:Mapped[int]=mapped_column(Integer);status:Mapped[str]=mapped_column(String(30),default="pending");approval_required:Mapped[bool]=mapped_column(default=False);summary:Mapped[str|None]=mapped_column(String(500))
class ProductDocument(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="product_documents";project_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("projects.id"));document_type:Mapped[str]=mapped_column(String(40));version:Mapped[int]=mapped_column(Integer,default=1);title:Mapped[str]=mapped_column(String(200));content:Mapped[dict]=mapped_column(JSONType,default=dict);status:Mapped[str]=mapped_column(String(40),default="draft");generated_by_employee_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("employees.id"))
class DeploymentRecord(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="deployment_records";project_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("projects.id"));status:Mapped[str]=mapped_column(String(30),default="created");artifact_plan:Mapped[dict]=mapped_column(JSONType,default=dict);version_label:Mapped[str]=mapped_column(String(80));approval_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("approvals.id"));previous_record_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("deployment_records.id"));failure_reason:Mapped[str|None]=mapped_column(Text)
class BuildLog(UUIDPrimaryKeyMixin,CreatedAtMixin,Base):
 __tablename__="build_logs";deployment_record_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("deployment_records.id"));result:Mapped[str]=mapped_column(String(20),default="pending");summary:Mapped[str]=mapped_column(Text);details:Mapped[dict]=mapped_column(JSONType,default=dict)
class MemoryIndex(UUIDPrimaryKeyMixin,CreatedAtMixin,Base):
 __tablename__="memory_index";memory_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("memories.id"),unique=True);scope:Mapped[str]=mapped_column(String(40));project_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("projects.id"));founder_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("users.id"));title:Mapped[str]=mapped_column(String(200));tags:Mapped[list]=mapped_column(JSONType,default=list);search_text:Mapped[str]=mapped_column(Text);vector_reference:Mapped[str|None]=mapped_column(String(255),unique=True)
class TaskAssignmentHistory(UUIDPrimaryKeyMixin,CreatedAtMixin,Base):
 __tablename__="task_assignment_history";task_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("tasks.id"));employee_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("employees.id"));assigned_by_employee_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("employees.id"));action:Mapped[str]=mapped_column(String(30));reason:Mapped[str]=mapped_column(String(500));score_snapshot:Mapped[dict]=mapped_column(JSONType,default=dict)
class OfficeLayout(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="office_layout";name:Mapped[str]=mapped_column(String(80));theme:Mapped[str]=mapped_column(String(40),default="luxury-dark");layout:Mapped[dict]=mapped_column(JSONType,default=dict)
class EmployeePosition(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="employee_position";employee_id:Mapped[uuid.UUID]=mapped_column(Uuid,ForeignKey("employees.id"),unique=True);room_id:Mapped[str]=mapped_column(String(40));x:Mapped[float]=mapped_column(Float,default=0);y:Mapped[float]=mapped_column(Float,default=0);z:Mapped[float]=mapped_column(Float,default=0);facing:Mapped[float]=mapped_column(Float,default=0)
class OfficePreference(UUIDPrimaryKeyMixin,TimestampMixin,Base):
 __tablename__="office_preferences";founder_id:Mapped[uuid.UUID|None]=mapped_column(Uuid,ForeignKey("users.id"));key:Mapped[str]=mapped_column(String(80));value:Mapped[dict]=mapped_column(JSONType,default=dict)

