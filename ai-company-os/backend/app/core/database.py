from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session,sessionmaker
from app.core.config import get_settings
from app.models.base import Base
engine=create_engine(get_settings().database_url,pool_pre_ping=True)
SessionLocal=sessionmaker(bind=engine,autoflush=False,autocommit=False,expire_on_commit=False,class_=Session)
def get_db()->Generator[Session,None,None]:
 db=SessionLocal()
 try: yield db
 finally: db.close()
