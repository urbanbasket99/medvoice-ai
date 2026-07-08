"""create audit tables

Revision ID: 202607072500
Revises: 202607072400
Create Date: 2026-07-07 25:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "202607072500"
down_revision = "202607072400"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("user_id", UUID(as_uuid=True), nullable=True),
        sa.Column("user_name", sa.String(200), nullable=True),
        sa.Column("role", sa.String(200), nullable=True),
        sa.Column("module", sa.String(50), nullable=False),
        sa.Column("entity", sa.String(100), nullable=False),
        sa.Column("entity_id", UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("old_value", JSONB, nullable=True),
        sa.Column("new_value", JSONB, nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("request_id", sa.String(64), nullable=True),
    )
    op.create_index("ix_audit_logs_timestamp", "audit_logs", ["timestamp"])
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_module", "audit_logs", ["module"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_entity_id", "audit_logs", ["entity_id"])
    op.create_index("ix_audit_logs_request_id", "audit_logs", ["request_id"])

    conn = op.get_bind()
    admin_user = conn.execute(
        sa.text("SELECT id, full_name FROM users WHERE email = 'admin@medvoice.com' LIMIT 1")
    ).fetchone()

    if admin_user:
        conn.execute(
            sa.text(
                """
                INSERT INTO audit_logs (
                    id, timestamp, user_id, user_name, role, module, entity, entity_id,
                    action, description, old_value, new_value, ip_address, user_agent, request_id
                ) VALUES
                (
                    gen_random_uuid(), NOW(), :user_id, :user_name, 'Administrator', 'auth', 'User', :user_id,
                    'login', 'Administrator logged into MedVoice AI HMS', NULL,
                    jsonb_build_object('method', 'POST', 'path', '/api/v1/auth/login', 'status_code', 200),
                    '127.0.0.1', 'MedVoice-Seed/1.0', 'seed-audit-001'
                ),
                (
                    gen_random_uuid(), NOW() - INTERVAL '1 hour', :user_id, :user_name, 'Administrator',
                    'patients', 'Patient', NULL, 'view', 'Viewed patient list', NULL,
                    jsonb_build_object('method', 'GET', 'path', '/api/v1/patients', 'status_code', 200),
                    '127.0.0.1', 'MedVoice-Seed/1.0', 'seed-audit-002'
                ),
                (
                    gen_random_uuid(), NOW() - INTERVAL '2 hours', :user_id, :user_name, 'Administrator',
                    'billing', 'Invoice', NULL, 'create', 'Created a new patient invoice', NULL,
                    jsonb_build_object('method', 'POST', 'path', '/api/v1/billing/invoices', 'status_code', 201),
                    '127.0.0.1', 'MedVoice-Seed/1.0', 'seed-audit-003'
                )
                """
            ),
            {"user_id": admin_user[0], "user_name": admin_user[1]},
        )


def downgrade() -> None:
    op.drop_index("ix_audit_logs_request_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_entity_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_action", table_name="audit_logs")
    op.drop_index("ix_audit_logs_module", table_name="audit_logs")
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_timestamp", table_name="audit_logs")
    op.drop_table("audit_logs")
