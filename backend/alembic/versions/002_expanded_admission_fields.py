"""Expand admission form with new student/guardian fields

Revision ID: 002_expanded_admission_fields
Revises: 001_rbac_admission_fields
Create Date: 2026-04-29
"""

from alembic import op
import sqlalchemy as sa

revision = "002_expanded_admission_fields"
down_revision = "001_rbac_admission_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IF NOT EXISTS makes each statement idempotent — safe whether the table
    # was created by create_all (fresh DB) or a prior partial migration.
    op.execute("ALTER TABLE admissions ADD COLUMN IF NOT EXISTS guardian_cnic     VARCHAR(20)")
    op.execute("ALTER TABLE admissions ADD COLUMN IF NOT EXISTS school_name       VARCHAR(150)")
    op.execute("ALTER TABLE admissions ADD COLUMN IF NOT EXISTS age               VARCHAR(10)")
    op.execute("ALTER TABLE admissions ADD COLUMN IF NOT EXISTS gender            VARCHAR(10)")
    op.execute("ALTER TABLE admissions ADD COLUMN IF NOT EXISTS tuition_type      VARCHAR(30)")
    op.execute("ALTER TABLE admissions ADD COLUMN IF NOT EXISTS specific_subjects VARCHAR(500)")
    op.execute("ALTER TABLE admissions ADD COLUMN IF NOT EXISTS struggling_with   TEXT")


def downgrade() -> None:
    op.drop_column("admissions", "struggling_with")
    op.drop_column("admissions", "specific_subjects")
    op.drop_column("admissions", "tuition_type")
    op.drop_column("admissions", "gender")
    op.drop_column("admissions", "age")
    op.drop_column("admissions", "school_name")
    op.drop_column("admissions", "guardian_cnic")
