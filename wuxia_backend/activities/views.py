from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from activities.models import ActivityType
from activities.services import grant_xp

class PerformActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        activity_name = request.data.get("activity")

        try:
            activity = ActivityType.objects.get(name=activity_name)
        except ActivityType.DoesNotExist:
            return Response({"error": "Invalid activity"}, status=400)

        result = grant_xp(request.user, activity)

        return Response({
            "message": "XP granted",
            **result
        })
