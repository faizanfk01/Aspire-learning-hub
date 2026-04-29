# Import all models here so Alembic autogenerate and Base.metadata.create_all
# can discover every table in a single import.
from app.models.base import Base  # noqa: F401
from app.models.user import User, UserRole  # noqa: F401
from app.models.user_otp import UserOTP  # noqa: F401
from app.models.admission import Admission, AdmissionStatus  # noqa: F401
from app.models.content import Content  # noqa: F401
from app.models.conversation_summary import ConversationSummary  # noqa: F401
from app.models.contact import ContactMessage  # noqa: F401
from app.models.review import Review  # noqa: F401
