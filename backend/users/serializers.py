from rest_framework import serializers
from django.contrib.auth import get_user_model
from courses.serializers import EnrollmentSerializer
from certificates.serializers import CertificateSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    enrollments = EnrollmentSerializer(many=True, read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'enrollments', 'certificates']
        read_only_fields = ['id', 'username', 'role']
