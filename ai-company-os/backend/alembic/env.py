from alembic import context
from sqlalchemy import engine_from_config,pool
from app.core.config import get_settings
from app.models import Base
import app.models.all_models
config=context.config
target_metadata=Base.metadata
def run_migrations_offline():
 context.configure(url=str(get_settings().database_url),target_metadata=target_metadata,literal_binds=True)
 with context.begin_transaction():context.run_migrations()
def run_migrations_online():
 c=engine_from_config({'sqlalchemy.url':str(get_settings().database_url)},prefix='sqlalchemy.',poolclass=pool.NullPool)
 with c.connect() as con:
  context.configure(connection=con,target_metadata=target_metadata)
  with context.begin_transaction():context.run_migrations()
run_migrations_offline() if context.is_offline_mode() else run_migrations_online()
