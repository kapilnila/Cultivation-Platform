from datetime import date
from .models import UserStreak

def get_streak_multiplier(user):
    try:
        streak = UserStreak.objects.get(user=user)
    except UserStreak.DoesNotExist:
        return 1.0

    days = streak.current_streak

    if days >= 30:
        return 2.0
    elif days >= 15:
        return 1.5
    elif days >= 8:
        return 1.25
    elif days >= 4:
        return 1.1
    return 1.0

