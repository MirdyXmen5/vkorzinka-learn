import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from users.models import User

class Command(BaseCommand):
    help = 'Import users from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', nargs='?', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        # Default path relative to project root
        default_path = os.path.join(settings.BASE_DIR.parent, 'users.csv')
        csv_path = options['csv_file'] or default_path
        
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_path}'))
            self.stdout.write(self.style.WARNING(f'Usage: python manage.py import_users [path/to/users.csv]'))
            return

        with open(csv_path, 'r') as file:
            reader = csv.DictReader(file)
            count = 0
            for row in reader:
                username = row['username']
                password = row['password']
                
                # Determine role
                role = User.Role.ADMIN if username == 'admin' else User.Role.EMPLOYEE
                
                # Create or update user
                user, created = User.objects.get_or_create(username=username)
                user.set_password(password)
                user.role = role
                if role == User.Role.ADMIN:
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
                
                action = "Created" if created else "Updated"
                self.stdout.write(f'{action} user: {username} ({role})')
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} users'))
