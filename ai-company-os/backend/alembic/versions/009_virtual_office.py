"""virtual office layout, positions, and founder preferences"""
import sqlalchemy as sa
from alembic import op

revision = "009_virtual_office"
down_revision = "008_delivery_memory"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    if "office_layout" not in tables:
        op.create_table(
            "office_layout",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("name", sa.String(80), nullable=False),
            sa.Column("theme", sa.String(40), nullable=False, server_default="luxury-dark"),
            sa.Column("layout", sa.JSON(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
    if "employee_position" not in tables:
        op.create_table(
            "employee_position",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("employee_id", sa.Uuid(), sa.ForeignKey("employees.id"), nullable=False, unique=True),
            sa.Column("room_id", sa.String(40), nullable=False),
            sa.Column("x", sa.Float(), nullable=False, server_default="0"),
            sa.Column("y", sa.Float(), nullable=False, server_default="0"),
            sa.Column("z", sa.Float(), nullable=False, server_default="0"),
            sa.Column("facing", sa.Float(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
    if "office_preferences" not in tables:
        op.create_table(
            "office_preferences",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("founder_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("key", sa.String(80), nullable=False),
            sa.Column("value", sa.JSON(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())
    for name in ("office_preferences", "employee_position", "office_layout"):
        if name in tables:
            op.drop_table(name)
