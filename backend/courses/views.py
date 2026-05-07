from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from django.utils import timezone
from certificates.models import Certificate
from django.utils.translation import gettext as _

from users.permissions import IsAdminUserRole

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Course.objects.all()

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        if created:
            return Response({'status': 'enrolled'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already enrolled'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        course = self.get_object()
        
        # Check if course has a test
        if hasattr(course, 'test'):
             return Response(
                 {'error': _('This course has a final test. You must pass the test to complete the course.')}, 
                 status=status.HTTP_400_BAD_REQUEST
             )

        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
        if not enrollment:
            return Response({'error': _('Not enrolled')}, status=status.HTTP_400_BAD_REQUEST)
        
        # Allow re-completion to update name, but check status
        if not enrollment.is_completed:
            enrollment.is_completed = True
            enrollment.completed_at = timezone.now()
            enrollment.save()
        
        # Generate Certificate (or update existing)
        recipient_name = request.data.get('recipient_name')
        self._generate_certificate(request.user, course, recipient_name)
        
        return Response({'status': 'completed', 'certificate_generated': True})

    @action(detail=True, methods=['post'])
    def submit_test(self, request, pk=None):
        course = self.get_object()
        if not hasattr(course, 'test'):
            return Response({'error': _('This course does not have a test.')}, status=status.HTTP_400_BAD_REQUEST)
            
        test = course.test
        questions = test.questions.all()
        submitted_answers = request.data.get('answers', {}) # Dict: {question_id: answer_id}
        
        correct_count = 0
        total_questions = questions.count()
        
        if total_questions == 0:
             return Response({'error': _('Test has no questions.')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        for question in questions:
            submitted_answer_id = submitted_answers.get(str(question.id))
            if submitted_answer_id:
                # Check if the submitted answer is correct
                try:
                    answer = question.answers.get(id=submitted_answer_id)
                    if answer.is_correct:
                        correct_count += 1
                except (ValueError, question.answers.model.DoesNotExist):
                    pass # Invalid answer ID or not found, counts as wrong
        
        score = (correct_count / total_questions) * 100
        passed = score >= test.pass_score
        
        result_data = {
            'score': score,
            'passed': passed,
            'total_questions': total_questions,
            'correct_count': correct_count,
            'pass_score': test.pass_score
        }
        
        if passed:
            enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
            if enrollment:
                if not enrollment.is_completed:
                    enrollment.is_completed = True
                    enrollment.completed_at = timezone.now()
                    enrollment.save()
                
                # Generate Certificate (always ensure one exists on pass)
                # Check for name in request data (e.g. from a test form prompt)
                recipient_name = request.data.get('recipient_name')
                self._generate_certificate(request.user, course, recipient_name)
                result_data['certificate_generated'] = True
            
                result_data['certificate_generated'] = True
            
        return Response(result_data)

    @action(detail=True, methods=['delete'])
    def delete_test(self, request, pk=None):
        course = self.get_object()
        if hasattr(course, 'test'):
            course.test.delete()
            return Response({'status': 'test deleted'})
        return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def retake(self, request, pk=None):
        course = self.get_object()
        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
        if enrollment:
            enrollment.is_completed = False
            enrollment.completed_at = None
            enrollment.save()
            # Optional: Delete old certificate on retake?
            # Certificate.objects.filter(user=request.user, course=course).delete()
            return Response({'status': 'reset for retake'})
        return Response({'error': _('Not enrolled')}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def issue_certificate(self, request, pk=None):
        course = self.get_object()
        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
        
        if not enrollment or not enrollment.is_completed:
            return Response({'error': _('Course not completed')}, status=status.HTTP_400_BAD_REQUEST)
            
        recipient_name = request.data.get('recipient_name')
        if not recipient_name:
            return Response({'error': _('Recipient name is required')}, status=status.HTTP_400_BAD_REQUEST)
            
        self._generate_certificate(request.user, course, recipient_name)
        return Response({'status': 'certificate issued'})

    def _generate_certificate(self, user, course, recipient_name=None):
        from certificates.models import Certificate
        from certificates.utils import generate_certificate_pdf
        
        # Use update_or_create to prevent multiple certificates for the same course/user
        name_to_use = recipient_name or f"{user.first_name} {user.last_name}".strip() or user.username
        
        certificate, created = Certificate.objects.update_or_create(
            user=user, 
            course=course,
            defaults={'recipient_name': name_to_use}
        )
        
        # Generate PDF (always regenerate to ensure name matches)
        pdf_path = generate_certificate_pdf(certificate)
        certificate.pdf_file = pdf_path
        certificate.save()
        return certificate

class AdminStatisticsView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        from users.models import User
        from .models import Course, Enrollment
        from certificates.models import Certificate

        total_employees = User.objects.filter(role='EMPLOYEE').count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        total_completions = Enrollment.objects.filter(is_completed=True).count()
        total_certificates = Certificate.objects.count()

        completion_rate = (total_completions / total_enrollments * 100) if total_enrollments > 0 else 0

        return Response({
            'total_employees': total_employees,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_completions': total_completions,
            'total_certificates': total_certificates,
            'completion_rate': round(completion_rate, 2)
        })
