from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import CustomLoginView

def home(request):
    return JsonResponse({
        "message": "Wuxia Cultivation API is running 🚀"
    })
    
urlpatterns = [

    path('admin/', admin.site.urls),

    # JWT
    path('api/auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/activities/', include('activities.urls')),
    path('api/auth/', include('users.urls')),
    # User APIs
    path('api/cultivation/', include('cultivation.urls')),

   path("api/users/", include("users.urls")),
]
