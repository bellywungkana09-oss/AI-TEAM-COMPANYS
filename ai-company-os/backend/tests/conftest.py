import os
os.environ.setdefault('DATABASE_URL','sqlite://')
os.environ.setdefault('REDIS_URL','redis://localhost:6379/0')
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base,User,Department
import pytest
@pytest.fixture
def db():
 e=create_engine('sqlite://');Base.metadata.create_all(e);s=sessionmaker(bind=e)();yield s;s.close()
@pytest.fixture
def founder(db):
 x=User(email='f@test.local',name='Founder');db.add(x);db.commit();return x
@pytest.fixture
def department(db):
 x=Department(name='Technology',description='Tech');db.add(x);db.commit();return x
