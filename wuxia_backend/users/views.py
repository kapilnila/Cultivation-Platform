from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate

from .serializers import UserSignupSerializer
from .models import UserLocation
from cultivation.services import update_age_on_login


class CustomLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        age_data = update_age_on_login(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "login_status": age_data,
        })


class SignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        location = None
        try:
            loc = UserLocation.objects.get(user=user)
            location = {
                "city": loc.city,
                "region": loc.region,
                "country": loc.country,
            }
        except UserLocation.DoesNotExist:
            pass

        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "location": location,
        })


class LocationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            loc = UserLocation.objects.get(user=request.user)
            return Response({
                "city": loc.city,
                "region": loc.region,
                "country": loc.country,
            })
        except UserLocation.DoesNotExist:
            return Response({"city": "", "region": "", "country": ""})

    def post(self, request):
        city = request.data.get("city", "").strip()
        region = request.data.get("region", "").strip()
        country = request.data.get("country", "").strip()

        if not city or not region or not country:
            return Response(
                {"error": "City, region and country are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        loc, _ = UserLocation.objects.update_or_create(
            user=request.user,
            defaults={"city": city, "region": region, "country": country}
        )

        return Response({
            "message": "Location updated",
            "city": loc.city,
            "region": loc.region,
            "country": loc.country,
        })