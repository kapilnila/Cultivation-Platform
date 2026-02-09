from django.urls import path
from .views import RankingsView, DashboardView

urlpatterns = [
    path('rankings/', RankingsView.as_view(), name='rankings'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
