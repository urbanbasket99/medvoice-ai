"""create notifications tables

Revision ID: 202607072400
Revises: 202607072300
Create Date: 2026-07-07 24:00:00.000000
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "202607072400"
down_revision = "202607072300"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notifications",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("notification_type", sa.String(50), nullable=False),
        sa.Column(
            "severity",
            sa.String(20),
            nullable=False,
            server_default="information",
        ),
        sa.Column("is_read", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("action_url", sa.String(500), nullable=True),
        sa.Column("entity_type", sa.String(50), nullable=True),
        sa.Column("entity_id", UUID(as_uuid=True), nullable=True),
        sa.Column("metadata", JSONB, nullable=True),
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
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])

    op.create_table(
        "notification_preferences",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="RESTRICT"),
            nullable=False,
            unique=True,
        ),
        sa.Column("email_enabled", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("push_enabled", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("in_app_enabled", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column(
            "type_preferences",
            JSONB,
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
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

    # Seed sample notifications for the admin user if present.
    op.execute(
        sa.text(
            """
            DO $$
            DECLARE
                v_admin_id UUID;
            BEGIN
                SELECT id INTO v_admin_id
                FROM users
                WHERE email = 'admin@medvoice.com'
                LIMIT 1;

                IF v_admin_id IS NOT NULL THEN
                    INSERT INTO notifications
                        (id, user_id, title, message, notification_type, severity,
                         is_read, read_at, created_at, updated_at)
                    VALUES
                        (
                            gen_random_uuid(), v_admin_id,
                            'Welcome to MedVoice',
                            'Your system is ready. Explore the features from the dashboard.',
                            'information', 'information',
                            false, NULL, NOW(), NOW()
                        ),
                        (
                            gen_random_uuid(), v_admin_id,
                            'Appointment Reminder',
                            'Patient John Doe has an appointment scheduled tomorrow at 10:00 AM.',
                            'appointment_reminder', 'information',
                            false, NULL, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'
                        ),
                        (
                            gen_random_uuid(), v_admin_id,
                            'Low Stock Alert',
                            'Paracetamol 500mg stock is running low. Current stock: 12 units.',
                            'low_stock', 'warning',
                            false, NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
                        ),
                        (
                            gen_random_uuid(), v_admin_id,
                            'Lab Result Available',
                            'Blood test results for patient Jane Smith are ready for review.',
                            'lab_result', 'success',
                            true, NOW() - INTERVAL '3 hours',
                            NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'
                        ),
                        (
                            gen_random_uuid(), v_admin_id,
                            'Billing Reminder',
                            'Invoice #INV-000042 is overdue. Payment of ₹15,000 is pending.',
                            'billing_reminder', 'warning',
                            true, NOW() - INTERVAL '5 hours',
                            NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'
                        ),
                        (
                            gen_random_uuid(), v_admin_id,
                            'Radiology Report Ready',
                            'X-Ray report for patient Mike Johnson is available.',
                            'radiology_result', 'success',
                            false, NULL, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'
                        ),
                        (
                            gen_random_uuid(), v_admin_id,
                            'System Maintenance Scheduled',
                            'System maintenance is scheduled for Sunday 2:00 AM – 4:00 AM IST.',
                            'system_alert', 'warning',
                            false, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
                        );
                END IF;
            END $$;
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM notifications WHERE TRUE"))
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")
    op.drop_table("notification_preferences")
