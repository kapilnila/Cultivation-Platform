from django.db import transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from activities.models import ActivityType
from activities.services import grant_xp
from cultivation.tasks import generate_cultivation_lore


class PerformActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        activity_name = request.data.get("activity")

        if not activity_name:
            return Response(
                {"error": "Activity is required"},
                status=400
            )

        try:
            activity = ActivityType.objects.get(
                name=activity_name
            )
        except ActivityType.DoesNotExist:
            return Response(
                {"error": "Invalid activity"},
                status=400
            )

        result = grant_xp(
            request.user,
            activity
        )

        if result["leveled_up"]:
            transaction.on_commit(
                lambda: generate_cultivation_lore.delay(
                    request.user.id,
                    result["realm_level"],
                )
            )

        return Response({
            "status": "success",
            "data": result,
        })
