import os
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from certificates.models import Certificate

class Command(BaseCommand):
    help = 'Delete certificates older than 30 days'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(days=10)
        old_certificates = Certificate.objects.filter(issued_at__lt=cutoff)
        count = old_certificates.count()
        
        for cert in old_certificates:
            # Delete physical file
            try:
                if cert.pdf_file and os.path.isfile(cert.pdf_file.path):
                    os.remove(cert.pdf_file.path)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error deleting file for cert {cert.id}: {e}"))
            
            cert.delete()
            
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} old certificates'))
