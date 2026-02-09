from cultivation.models import UserCultivation, Realm
from activities.models import XPLog
from cultivation.utils import stage_multiplier
from .utils import get_streak_multiplier
from cultivation.models import Realm

def grant_xp(user, activity):
    cultivation = UserCultivation.objects.get(user=user)
    realm = Realm.objects.get(realm_level=cultivation.realm_level)
    if realm.max_lifespan != -1 and cultivation.platform_age_years >= realm.max_lifespan:
      return {
        "xp_gained": 0,
        "realm_level": cultivation.realm_level,
        "sub_level": cultivation.sub_level,
        "current_xp": cultivation.current_xp,
        "message": "Lifespan exhausted. Breakthrough required."
    }

    
    streak_multiplier = get_streak_multiplier(user)
    base_xp = activity.base_xp

    final_xp = int(base_xp * streak_multiplier)

    cultivation.current_xp += final_xp
    cultivation.total_xp += final_xp

    # Check sublevel progression
    required_xp = realm.base_xp * stage_multiplier(cultivation.sub_level)

    if cultivation.current_xp >= required_xp:
        cultivation.current_xp = 0
        cultivation.sub_level += 1

        # Breakthrough
        if cultivation.sub_level > 9:
            cultivation.realm_level += 1
            cultivation.sub_level = 1

    cultivation.save()

    XPLog.objects.create(
        user=user,
        activity=activity,
        xp_gained=final_xp,
        streak_multiplier=streak_multiplier
    )

    return {
        "xp_gained": final_xp,
        "realm_level": cultivation.realm_level,
        "sub_level": cultivation.sub_level,
        "current_xp": cultivation.current_xp,
    }
