

# Create your models here.
from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class Clan(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    region = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ClanMember(models.Model):
    ROLE_CHOICES = (
        ('LEADER', 'Leader'),
        ('ELDER', 'Elder'),
        ('MEMBER', 'Member'),
    )

    clan = models.ForeignKey(Clan, on_delete=models.CASCADE)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)
