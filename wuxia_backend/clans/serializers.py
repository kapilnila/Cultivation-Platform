from rest_framework import serializers
from .models import Clan, ClanMember


class ClanSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Clan
        fields = ['id', 'name', 'description', 'region', 'created_at', 'member_count']

    def get_member_count(self, obj):
        return obj.clanmember_set.count()


class ClanMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ClanMember
        fields = ['id', 'username', 'role', 'joined_at']