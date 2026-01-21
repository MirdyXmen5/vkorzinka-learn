from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Course(models.Model):
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'))
    thumbnail = models.ImageField(_('thumbnail'), upload_to='course_thumbnails/', blank=True, null=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')

    def __str__(self):
        return self.title

class CourseContent(models.Model):
    CONTENT_TYPES = (
        ('TEXT', _('Text')),
        ('IMAGE', _('Image')),
        ('VIDEO', _('Video')),
        ('DOCUMENT', _('Document')),
    )
    course = models.ForeignKey(Course, related_name='contents', on_delete=models.CASCADE, verbose_name=_('course'))
    content_type = models.CharField(_('content type'), max_length=10, choices=CONTENT_TYPES)
    title = models.CharField(_('title'), max_length=200)
    text_content = models.TextField(_('text content'), blank=True, null=True)
    image_file = models.ImageField(_('image file'), upload_to='course_images/', blank=True, null=True)
    image_url = models.URLField(_('image URL'), blank=True, null=True)
    video_url = models.URLField(_('video URL'), blank=True, null=True) # YouTube/Vimeo
    file_url = models.URLField(_('file URL'), blank=True, null=True) # Google Drive, etc.
    order = models.PositiveIntegerField(_('order'), default=0)

    class Meta:
        ordering = ['order']
        verbose_name = _('Course Content')
        verbose_name_plural = _('Course Contents')

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Test(models.Model):
    course = models.OneToOneField(Course, related_name='test', on_delete=models.CASCADE, verbose_name=_('course'))
    title = models.CharField(_('title'), max_length=200)
    pass_score = models.PositiveIntegerField(_('pass score'), default=70) # Percentage

    class Meta:
        verbose_name = _('Test')
        verbose_name_plural = _('Tests')

    def __str__(self):
        return self.title

class Question(models.Model):
    test = models.ForeignKey(Test, related_name='questions', on_delete=models.CASCADE, verbose_name=_('test'))
    text = models.TextField(_('text'))

    class Meta:
        verbose_name = _('Question')
        verbose_name_plural = _('Questions')

    def __str__(self):
        return self.text

class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE, verbose_name=_('question'))
    text = models.CharField(_('text'), max_length=200)
    is_correct = models.BooleanField(_('is correct'), default=False)

    class Meta:
        verbose_name = _('Answer')
        verbose_name_plural = _('Answers')

    def __str__(self):
        return self.text

class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='enrollments', on_delete=models.CASCADE, verbose_name=_('user'))
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE, verbose_name=_('course'))
    enrolled_at = models.DateTimeField(_('enrolled at'), auto_now_add=True)
    is_completed = models.BooleanField(_('is completed'), default=False)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    
    class Meta:
        unique_together = ('user', 'course')
        verbose_name = _('Enrollment')
        verbose_name_plural = _('Enrollments')

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
