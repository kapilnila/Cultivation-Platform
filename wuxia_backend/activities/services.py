from datetime import date, timedelta
from cultivation.models import UserCultivation, Realm
from activities.models import XPLog, UserStreak, DailyActivityLog
from cultivation.utils import stage_multiplier
from .utils import get_streak_multiplier

DAILY_LIMIT = 3


def grant_xp(user, activity):
    cultivation = UserCultivation.objects.get(user=user)
    realm = Realm.objects.get(realm_level=cultivation.realm_level)

    # Lifespan check
    if realm.max_lifespan != -1 and cultivation.platform_age_years >= realm.max_lifespan:
        return {
            "xp_gained": 0,
            "realm_level": cultivation.realm_level,
            "sub_level": cultivation.sub_level,
            "current_xp": cultivation.current_xp,
            "blocked": True,
            "message": "Lifespan exhausted. Breakthrough required."
        }

    # Daily limit check
    today = date.today()
    daily_log, _ = DailyActivityLog.objects.get_or_create(
        user=user, activity=activity, date=today,
        defaults={"count": 0}
    )
    if daily_log.count >= DAILY_LIMIT:
        return {
            "xp_gained": 0,
            "realm_level": cultivation.realm_level,
            "sub_level": cultivation.sub_level,
            "current_xp": cultivation.current_xp,
            "blocked": True,
            "message": f"{activity.name} limit reached for today (max {DAILY_LIMIT}). Come back tomorrow."
        }

    # Streak update
    streak, created = UserStreak.objects.get_or_create(
        user=user,
        defaults={"current_streak": 1, "last_active_date": today}
    )
    if not created and streak.last_active_date != today:
        if streak.last_active_date == today - timedelta(days=1):
            streak.current_streak += 1
        else:
            streak.current_streak = 1
        streak.last_active_date = today
        streak.save()

    streak_multiplier = get_streak_multiplier(user)
    final_xp = int(activity.base_xp * streak_multiplier)

    cultivation.current_xp += final_xp
    cultivation.total_xp += final_xp

    required_xp = realm.base_xp * stage_multiplier(cultivation.sub_level)

    if cultivation.current_xp >= required_xp:
        cultivation.current_xp = 0
        cultivation.sub_level += 1
        if cultivation.sub_level > 9:
            cultivation.realm_level += 1
            cultivation.sub_level = 1

    cultivation.save()

    # Increment daily log
    daily_log.count += 1
    daily_log.save()

    XPLog.objects.create(
        user=user,
        activity=activity,
        xp_gained=final_xp,
        streak_multiplier=streak_multiplier
    )

    required_xp = realm.base_xp * stage_multiplier(cultivation.sub_level)

    return {
        "xp_gained": final_xp,
        "streak": streak.current_streak,
        "streak_multiplier": streak_multiplier,
        "realm_level": cultivation.realm_level,
        "sub_level": cultivation.sub_level,
        "current_xp": cultivation.current_xp,
        "total_xp": cultivation.total_xp,
        "required_xp": required_xp,
        "xp_percent": int((cultivation.current_xp / required_xp) * 100) if required_xp > 0 else 0,
        "daily_count": daily_log.count,
        "daily_remaining": DAILY_LIMIT - daily_log.count,
        "blocked": False,
        "message": "XP granted"
    }