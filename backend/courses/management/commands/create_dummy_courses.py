import random
from django.core.management.base import BaseCommand
from courses.models import Course, CourseContent, Test, Question, Answer
from django.utils import timezone

class Command(BaseCommand):
    help = 'Create dummy courses for development'

    def handle(self, *args, **options):
        self.stdout.write('Creating dummy courses...')

        # clear existing data
        Course.objects.all().delete()
        
        course_data = [
            {
                'title': 'Effective Communication',
                'description': 'Learn how to communicate effectively in a corporate environment. This course covers email etiquette, verbal communication, and body language.',
                'image': 'https://via.placeholder.com/640x360.png/5cad2d/ffffff?text=Communication' 
            },
            {
                'title': 'Project Management 101',
                'description': 'Introduction to project management methodologies including Agile and Waterfall. Learn how to manage time, resources, and risks.',
                'image': 'https://via.placeholder.com/640x360.png/5cad2d/ffffff?text=Project+Management'
            },
            {
                'title': 'Data Security Basics',
                'description': 'Essential knowledge for keeping company data secure. Covers password management, phishing attacks, and data classification.',
                'image': 'https://via.placeholder.com/640x360.png/5cad2d/ffffff?text=Security'
            },
            {
                'title': 'Leadership Skills',
                'description': 'Develop your leadership potential. Learn about different leadership styles, motivation techniques, and how to build strong teams.',
                'image': 'https://via.placeholder.com/640x360.png/5cad2d/ffffff?text=Leadership'
            },
             {
                'title': 'Sales Techniques',
                'description': 'Master the art of selling. This course covers prospecting, negotiation, closing deals, and maintaining client relationships.',
                'image': 'https://via.placeholder.com/640x360.png/5cad2d/ffffff?text=Sales'
            }
        ]

        for data in course_data:
            course = Course.objects.create(
                title=data['title'],
                description=data['description'],
                created_at=timezone.now()
            )
            # You might want to handle the image field properly if using actual files, 
            # but for now we won't set the FileField or we'd need to download/verify.
            # Leaving thumbnail empty or doing a mock if needed.
            
            self.stdout.write(f'Created course: {course.title}')

            # Create random content
            for i in range(1, 4):
                CourseContent.objects.create(
                    course=course,
                    content_type='TEXT',
                    title=f'Lesson {i}: Introduction',
                    text_content=f'This is the content for lesson {i} of {course.title}. ' * 10,
                    order=i
                )
            
            # Create a Test for all except the last one (Sales Techniques) to test manual completion
            if data['title'] != 'Sales Techniques':
                test = Test.objects.create(
                    course=course,
                    title=f'{course.title} Final Exam',
                    pass_score=70
                )

                # Create Questions
                for q in range(1, 6):
                    question = Question.objects.create(
                        test=test,
                        text=f'Question {q} for {course.title}?'
                    )
                    
                    # Create Answers
                    Answer.objects.create(question=question, text='Correct Answer', is_correct=True)
                    Answer.objects.create(question=question, text='Wrong Answer 1', is_correct=False)
                    Answer.objects.create(question=question, text='Wrong Answer 2', is_correct=False)
            else:
                self.stdout.write(f'Skipping test creation for {course.title} (Manual completion test)')

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(course_data)} courses'))
