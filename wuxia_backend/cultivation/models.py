from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Realm(models.Model):
    name = models.CharField(max_length=100)
    realm_level = models.IntegerField(unique=True)
    base_xp = models.IntegerField()
    max_lifespan = models.IntegerField()  # -1 = immortal
    intro_text = models.TextField()
    title = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class UserCultivation(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    realm_level = models.IntegerField(default=0)
    sub_level = models.IntegerField(default=1)
    current_xp = models.IntegerField(default=0)
    total_xp = models.IntegerField(default=0)           # ← ADDED
    platform_age_years = models.IntegerField(default=0)
    last_login_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} - Realm {self.realm_level}"