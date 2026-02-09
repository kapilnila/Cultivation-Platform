from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from cultivation.services import get_ranked_users,get_dashboard_data

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_dashboard_data(request.user)
        return Response(data)


class RankingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = request.query_params.get("scope")   # city / region / country / global
        value = request.query_params.get("value")   # e.g. Bangalore / Karnataka / India

        rankings = get_ranked_users(scope, value)

        data = []
        for idx, uc in enumerate(rankings, start=1):
            data.append({
                "rank": idx,
                "username": uc.user.username,
                "realm_level": uc.realm_level,
                "sub_level": uc.sub_level,
                "total_xp": uc.total_xp,
                "age": uc.platform_age_years,
            })

        return Response({
            "scope": scope or "global",
            "results": data
        })
