from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView


def home(_):
    return JsonResponse({"message": "Wuxia Cultivation API is running"})


def health(_):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path('', home),
    path('health/', health),
    path('admin/', admin.site.urls),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('users.urls')),
    path('api/activities/', include('activities.urls')),
    path('api/cultivation/', include('cultivation.urls')),
    path('api/clans/', include('clans.urls')),
]