from django.db import models
from django.conf import settings


User = settings.AUTH_USER_MODEL


class ActivityType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    base_xp = models.IntegerField()

    def __str__(self):
        return self.name



class XPLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity = models.ForeignKey(ActivityType, on_delete=models.CASCADE)
    xp_gained = models.IntegerField()
    streak_multiplier = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)


class UserStreak(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    current_streak = models.IntegerField(default=0)
    last_active_date = models.DateField()


class DailyActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity = models.ForeignKey(ActivityType, on_delete=models.CASCADE)
    date = models.DateField()
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'activity', 'date')