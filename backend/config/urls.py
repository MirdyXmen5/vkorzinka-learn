"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from users.views import UserProfileView, UserListView
from courses.views import CourseViewSet, AdminStatisticsView
from certificates.views import CertificateViewSet

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'certificates', CertificateViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
    path('api/profile/', UserProfileView.as_view(), name='profile'),
    path('api/admin/stats/', AdminStatisticsView.as_view(), name='admin_stats'),
    path('api/admin/users/', UserListView.as_view(), name='admin_users'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
