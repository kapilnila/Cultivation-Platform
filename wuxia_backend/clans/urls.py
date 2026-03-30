from django.urls import path
from .views import ClanListView, ClanDetailView, JoinClanView, LeaveClanView, MyClanView

urlpatterns = [
    path('', ClanListView.as_view(), name='clan-list'),
    path('my/', MyClanView.as_view(), name='my-clan'),
    path('leave/', LeaveClanView.as_view(), name='leave-clan'),
    path('<int:clan_id>/', ClanDetailView.as_view(), name='clan-detail'),
    path('<int:clan_id>/join/', JoinClanView.as_view(), name='join-clan'),
]