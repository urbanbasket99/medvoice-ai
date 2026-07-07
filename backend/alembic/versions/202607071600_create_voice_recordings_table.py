"""create voice_recordings table

Revision ID: 202607071600
Revises: 202607071400
Create Date: 2026-07-07 16:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "202607071600"
down_revision: Union[str, None] = "202607071400"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "voice_recordings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "consultation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("consultations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "patient_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("patients.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "doctor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("doctors.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("file_name", sa.String(255), nullable=True),
        sa.Column("storage_path", sa.String(512), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("audio_format", sa.String(32), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="recording"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_voice_recordings_consultation_id",
        "voice_recordings",
        ["consultation_id"],
    )
    op.create_index(
        "ix_voice_recordings_patient_id",
        "voice_recordings",
        ["patient_id"],
    )
    op.create_index(
        "ix_voice_recordings_doctor_id",
        "voice_recordings",
        ["doctor_id"],
    )
    op.create_index(
        "ix_voice_recordings_status",
        "voice_recordings",
        ["status"],
    )


def downgrade() -> None:
    op.drop_index("ix_voice_recordings_status", table_name="voice_recordings")
    op.drop_index("ix_voice_recordings_doctor_id", table_name="voice_recordings")
    op.drop_index("ix_voice_recordings_patient_id", table_name="voice_recordings")
    op.drop_index("ix_voice_recordings_consultation_id", table_name="voice_recordings")
    op.drop_table("voice_recordings")
