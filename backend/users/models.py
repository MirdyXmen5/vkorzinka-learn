from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        EMPLOYEE = 'EMPLOYEE', _('Employee')
        ADMIN = 'ADMIN', _('Administrator')

    role = models.CharField(_('role'), max_length=50, choices=Role.choices, default=Role.EMPLOYEE)

    def is_admin(self):
        return self.role == self.Role.ADMIN
