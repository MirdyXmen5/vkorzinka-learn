from django.core.management.base import BaseCommand
from django.utils import timezone
from certificates.models import Certificate
from datetime import timedelta

class Command(BaseCommand):
    help = 'Delete certificates older than 1 month'

    def handle(self, *args, **options):
        cutoff_date = timezone.now() - timedelta(days=30)
        certificates = Certificate.objects.filter(issued_at__lt=cutoff_date)
        count = certificates.count()
        
        # Delete files (optional, if using FileField cleanup signal or manual deletion)
        # Django doesn't auto-delete files by default on delete() anymore in recent versions.
        # But for now, let's just delete the records.
        for cert in certificates:
            if cert.pdf_file:
                cert.pdf_file.delete(save=False)
            cert.delete()
            
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} old certificates'))
