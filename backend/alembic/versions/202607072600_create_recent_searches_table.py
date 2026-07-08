"""create recent searches table

Revision ID: 202607072600
Revises: 202607072500
Create Date: 2026-07-08 00:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision = "202607072600"
down_revision = "202607072500"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "recent_searches",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("query", sa.String(200), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_recent_searches_user_id", "recent_searches", ["user_id"])
    op.create_index(
        "uq_recent_searches_user_query",
        "recent_searches",
        ["user_id", "query"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_recent_searches_user_query", table_name="recent_searches")
    op.drop_index("ix_recent_searches_user_id", table_name="recent_searches")
    op.drop_table("recent_searches")
