from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Clan, ClanMember
from .serializers import ClanSerializer, ClanMemberSerializer


class ClanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clans = Clan.objects.all().order_by('name')
        serializer = ClanSerializer(clans, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Check if user already in a clan
        if ClanMember.objects.filter(user=request.user).exists():
            return Response(
                {"error": "You are already in a clan. Leave first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        name = request.data.get("name", "").strip()
        description = request.data.get("description", "").strip()
        region = request.data.get("region", "").strip()

        if not name or not description or not region:
            return Response(
                {"error": "Name, description and region are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Clan.objects.filter(name=name).exists():
            return Response(
                {"error": "A clan with this name already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        clan = Clan.objects.create(
            name=name,
            description=description,
            region=region
        )
        ClanMember.objects.create(
            clan=clan,
            user=request.user,
            role='LEADER'
        )

        return Response(ClanSerializer(clan).data, status=status.HTTP_201_CREATED)


class ClanDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, clan_id):
        try:
            clan = Clan.objects.get(id=clan_id)
        except Clan.DoesNotExist:
            return Response({"error": "Clan not found."}, status=status.HTTP_404_NOT_FOUND)

        members = ClanMember.objects.filter(clan=clan).select_related('user')
        return Response({
            "clan": ClanSerializer(clan).data,
            "members": ClanMemberSerializer(members, many=True).data
        })


class JoinClanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, clan_id):
        if ClanMember.objects.filter(user=request.user).exists():
            return Response(
                {"error": "You are already in a clan. Leave first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            clan = Clan.objects.get(id=clan_id)
        except Clan.DoesNotExist:
            return Response({"error": "Clan not found."}, status=status.HTTP_404_NOT_FOUND)

        ClanMember.objects.create(
            clan=clan,
            user=request.user,
            role='MEMBER'
        )

        return Response({"message": f"Joined {clan.name} successfully."})


class LeaveClanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            member = ClanMember.objects.get(user=request.user)
        except ClanMember.DoesNotExist:
            return Response({"error": "You are not in a clan."}, status=status.HTTP_400_BAD_REQUEST)

        if member.role == 'LEADER':
            clan = member.clan
            member_count = ClanMember.objects.filter(clan=clan).count()
            if member_count > 1:
                return Response(
                    {"error": "Transfer leadership before leaving."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            clan.delete()
            return Response({"message": "Clan disbanded and you have left."})

        member.delete()
        return Response({"message": "You have left the clan."})


class MyClanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            member = ClanMember.objects.select_related('clan').get(user=request.user)
            members = ClanMember.objects.filter(clan=member.clan).select_related('user')
            return Response({
                "in_clan": True,
                "role": member.role,
                "clan": ClanSerializer(member.clan).data,
                "members": ClanMemberSerializer(members, many=True).data
            })
        except ClanMember.DoesNotExist:
            return Response({"in_clan": False})
    