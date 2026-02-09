from django.urls import path
from .views import SignupView, ProfileView   # 👈 IMPORT BOTH
from .views import CustomLoginView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
