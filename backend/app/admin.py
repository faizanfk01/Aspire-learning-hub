from sqladmin import ModelView

from app.models.admission import Admission
from app.models.content import Content
from app.models.user import User


class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-users"

    column_list = [User.id, User.full_name, User.email, User.role, User.is_active]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.id, User.role, User.is_active]
    # String names are required for form_excluded_columns in sqladmin
    form_excluded_columns = ["hashed_password", "admissions"]


class AdmissionAdmin(ModelView, model=Admission):
    name = "Admission"
    name_plural = "Admissions"
    icon = "fa-solid fa-file-pen"

    # "student.full_name" resolves via the relationship to show the linked user name
    column_list = ["id", "student.full_name", "grade", "status", "created_at"]
    # form_columns must exactly match model attribute names (relationships by string name)
    form_columns = ["student", "father_name", "grade", "contact_number", "address", "status"]


class ContentAdmin(ModelView, model=Content):
    name = "Content"
    name_plural = "Content Items"
    icon = "fa-solid fa-book-open"

    column_list = [Content.id, Content.title, Content.content_type, Content.target_grade]
    column_searchable_list = [Content.title, Content.target_grade]
