from django.urls import path
from .views import PerformActivityView

urlpatterns = [
    path('perform/', PerformActivityView.as_view(), name='perform-activity'),
]
