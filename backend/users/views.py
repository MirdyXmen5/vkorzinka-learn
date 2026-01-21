from rest_framework import generics, permissions, views
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from .permissions import IsAdminUserRole

User = get_user_model()

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]
