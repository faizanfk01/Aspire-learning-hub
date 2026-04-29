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
    op.add_column("admissions", sa.Column("guardian_cnic",      sa.String(20),   nullable=True))
    op.add_column("admissions", sa.Column("school_name",        sa.String(150),  nullable=True))
    op.add_column("admissions", sa.Column("age",                sa.String(10),   nullable=True))
    op.add_column("admissions", sa.Column("gender",             sa.String(10),   nullable=True))
    op.add_column("admissions", sa.Column("tuition_type",       sa.String(30),   nullable=True))
    op.add_column("admissions", sa.Column("specific_subjects",  sa.String(500),  nullable=True))
    op.add_column("admissions", sa.Column("struggling_with",    sa.Text(),       nullable=True))


def downgrade() -> None:
    op.drop_column("admissions", "struggling_with")
    op.drop_column("admissions", "specific_subjects")
    op.drop_column("admissions", "tuition_type")
    op.drop_column("admissions", "gender")
    op.drop_column("admissions", "age")
    op.drop_column("admissions", "school_name")
    op.drop_column("admissions", "guardian_cnic")
