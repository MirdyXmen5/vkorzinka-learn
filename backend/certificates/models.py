from django.db import models
from django.conf import settings
from courses.models import Course
from django.utils.translation import gettext_lazy as _

class Certificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='certificates', on_delete=models.CASCADE, verbose_name=_('user'))
    course = models.ForeignKey(Course, related_name='certificates', on_delete=models.CASCADE, verbose_name=_('course'))
    recipient_name = models.CharField(_('recipient name'), max_length=255, blank=True, null=True)
    issued_at = models.DateTimeField(_('issued at'), auto_now_add=True)
    pdf_file = models.FileField(_('pdf file'), upload_to='certificates/')

    class Meta:
        verbose_name = _('Certificate')
        verbose_name_plural = _('Certificates')

    def __str__(self):
        return f"Certificate for {self.recipient_name or self.user.username} - {self.course.title}"
