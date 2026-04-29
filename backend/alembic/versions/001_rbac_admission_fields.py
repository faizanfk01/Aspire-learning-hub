"""Add is_admitted to users and student_name to admissions

Revision ID: 001_rbac_admission_fields
Revises:
Create Date: 2026-04-29
"""

from alembic import op
import sqlalchemy as sa

revision = "001_rbac_admission_fields"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IF NOT EXISTS makes these idempotent — safe to run on databases where
    # create_all already added these columns (e.g. fresh Render deployments).
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS "
        "is_admitted BOOLEAN NOT NULL DEFAULT FALSE"
    )
    op.execute(
        "ALTER TABLE admissions ADD COLUMN IF NOT EXISTS "
        "student_name VARCHAR(100)"
    )


def downgrade() -> None:
    op.drop_column("users", "is_admitted")
    op.drop_column("admissions", "student_name")
