import uuid
from datetime import datetime
from enum import StrEnum
from sqlalchemy import MetaData,DateTime,Uuid,func,JSON,Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase,Mapped,mapped_column
JSONType=JSON().with_variant(JSONB(),"postgresql")
class Base(DeclarativeBase): metadata=MetaData()
class UUIDPrimaryKeyMixin:
 id:Mapped[uuid.UUID]=mapped_column(Uuid,primary_key=True,default=uuid.uuid4)
class TimestampMixin:
 created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now())
 updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())
class CreatedAtMixin:
 created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now())
def enum_type(cls,name): return Enum(cls,name=name,native_enum=False,create_constraint=True,values_callable=lambda x:[v.value for v in x])
