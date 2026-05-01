"""Add attempts column to user_otps for brute-force protection

Revision ID: 004_otp_attempts
Revises: 003_review_declined
Create Date: 2026-05-01
"""

from alembic import op

revision = "004_otp_attempts"
down_revision = "003_review_declined"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE user_otps ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0"
    )


def downgrade() -> None:
    op.drop_column("user_otps", "attempts")
