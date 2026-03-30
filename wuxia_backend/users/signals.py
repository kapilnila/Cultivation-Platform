from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from datetime import date

User = settings.AUTH_USER_MODEL


@receiver(post_save, sender=User)
def create_user_cultivation(sender, instance, created, **kwargs):
    if not created:
        return
    from cultivation.models import UserCultivation
    from activities.models import UserStreak

    UserCultivation.objects.create(user=instance)
    UserStreak.objects.create(
        user=instance,
        current_streak=0,
        last_active_date=date.today()
    )