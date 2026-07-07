"""create transcriptions table

Revision ID: 202607071800
Revises: 202607071600
Create Date: 2026-07-07 18:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "202607071800"
down_revision: Union[str, None] = "202607071600"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "transcriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "recording_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("voice_recordings.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "consultation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("consultations.id", ondelete="RESTRICT"),
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
        sa.Column("language", sa.String(16), nullable=True),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("duration_seconds", sa.Float(), nullable=True),
        sa.Column("model_used", sa.String(128), nullable=True),
        sa.Column("audio_storage_path", sa.String(512), nullable=True),
        sa.Column("segments", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
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
    op.create_index("ix_transcriptions_recording_id", "transcriptions", ["recording_id"])
    op.create_index("ix_transcriptions_consultation_id", "transcriptions", ["consultation_id"])
    op.create_index("ix_transcriptions_patient_id", "transcriptions", ["patient_id"])
    op.create_index("ix_transcriptions_doctor_id", "transcriptions", ["doctor_id"])
    op.create_index("ix_transcriptions_status", "transcriptions", ["status"])


def downgrade() -> None:
    op.drop_index("ix_transcriptions_status", table_name="transcriptions")
    op.drop_index("ix_transcriptions_doctor_id", table_name="transcriptions")
    op.drop_index("ix_transcriptions_patient_id", table_name="transcriptions")
    op.drop_index("ix_transcriptions_consultation_id", table_name="transcriptions")
    op.drop_index("ix_transcriptions_recording_id", table_name="transcriptions")
    op.drop_table("transcriptions")
