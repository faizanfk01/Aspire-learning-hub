from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,    # test each connection before handing it to a request
    pool_size=5,           # persistent connections kept open per worker
    max_overflow=10,       # extra connections allowed when pool is fully used
    pool_timeout=30,       # seconds to wait for a free connection before raising
    pool_recycle=1800,     # force-close and replace connections after 30 min
    pool_use_lifo=True,    # prefer recently-used connections (fewer stale sockets)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
