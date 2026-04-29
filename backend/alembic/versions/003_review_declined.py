"""Add is_declined column to reviews

Revision ID: 003_review_declined
Revises: 002_expanded_admission_fields
Create Date: 2026-04-30
"""

from alembic import op

revision = "003_review_declined"
down_revision = "002_expanded_admission_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_declined BOOLEAN NOT NULL DEFAULT false"
    )


def downgrade() -> None:
    op.drop_column("reviews", "is_declined")
