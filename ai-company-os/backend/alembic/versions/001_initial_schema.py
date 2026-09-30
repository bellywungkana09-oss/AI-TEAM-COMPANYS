"""initial schema"""
from alembic import op
from app.models import Base
revision='001_initial_schema';down_revision=None;branch_labels=None;depends_on=None
def upgrade(): Base.metadata.create_all(bind=op.get_bind())
def downgrade(): Base.metadata.drop_all(bind=op.get_bind())
