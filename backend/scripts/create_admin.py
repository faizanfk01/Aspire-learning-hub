#!/usr/bin/env python3
# Usage: python scripts/create_admin.py --name "Admin Name" --email admin@aspire.com --password S3cur3Pass!
import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import Base  # ensure all models are registered
from app.models.user import User, UserRole


def create_admin(full_name: str, email: str, password: str) -> None:
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == email).first():
            print(f"[!] User '{email}' already exists. Aborting.")
            sys.exit(1)
        user = User(
            full_name=full_name,
            email=email,
            hashed_password=get_password_hash(password),
            role=UserRole.admin,
            is_active=True,
        )
        db.add(user)
        db.commit()
        print(f"[✓] Admin user '{email}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an Aspire Learning Hub admin user")
    parser.add_argument("--name",     required=True, help="Full name")
    parser.add_argument("--email",    required=True, help="Email address")
    parser.add_argument("--password", required=True, help="Password (min 8 chars recommended)")
    args = parser.parse_args()

    if len(args.password) < 8:
        print("[!] Password must be at least 8 characters.")
        sys.exit(1)

    create_admin(args.name, args.email, args.password)
