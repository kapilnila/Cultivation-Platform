from datetime import date
from cultivation.models import UserCultivation, Realm
from users.models import UserLocation
from cultivation.models import Realm, UserCultivation
from cultivation.utils import stage_multiplier, stage_name
AGE_INCREMENT_YEARS = 2

def update_age_on_login(user):
    cultivation, _ = UserCultivation.objects.get_or_create(user=user)

    today = date.today()

    # First login ever
    if cultivation.last_login_date is None:
        cultivation.last_login_date = today
        cultivation.save()
        return {
            "age_updated": False,
            "platform_age": cultivation.platform_age_years,
            "status": "first_login"
        }

    # Same-day login → no age increment
    if cultivation.last_login_date == today:
        return {
            "age_updated": False,
            "platform_age": cultivation.platform_age_years,
            "status": "already_logged_today"
        }

    # Update age
    cultivation.platform_age_years += AGE_INCREMENT_YEARS
    cultivation.last_login_date = today
    cultivation.save()

    realm = Realm.objects.get(realm_level=cultivation.realm_level)

    # Immortal realm → no limit
    if realm.max_lifespan == -1:
        return {
            "age_updated": True,
            "platform_age": cultivation.platform_age_years,
            "status": "immortal"
        }

    # Lifespan checks
    age = cultivation.platform_age_years
    max_life = realm.max_lifespan

    if age >= max_life:
        return {
            "age_updated": True,
            "platform_age": age,
            "status": "life_exhausted"
        }

    if age >= int(0.8 * max_life):
        return {
            "age_updated": True,
            "platform_age": age,
            "status": "life_warning"
        }

    return {
        "age_updated": True,
        "platform_age": age,
        "status": "normal"
    }

def get_ranked_users(scope=None, value=None, limit=50):
    qs = UserCultivation.objects.select_related('user')

    if scope == "city":
        qs = qs.filter(user__userlocation__city=value)
    elif scope == "region":
        qs = qs.filter(user__userlocation__region=value)
    elif scope == "country":
        qs = qs.filter(user__userlocation__country=value)
    # global → no filter

    return qs.order_by(
        '-realm_level',
        '-sub_level',
        '-total_xp',
        'platform_age_years'
    )[:limit]
    

def get_dashboard_data(user):
    cultivation,_ = UserCultivation.objects.get_or_create(user=user)
    realm = Realm.objects.get(realm_level=cultivation.realm_level)

    required_xp = realm.base_xp * stage_multiplier(cultivation.sub_level)

    xp_percent = int(
        (cultivation.current_xp / required_xp) * 100
    ) if required_xp > 0 else 0

    # Lifespan checks
    lifespan_status = "immortal"
    xp_blocked = False

    if realm.max_lifespan != -1:
        if cultivation.platform_age_years >= realm.max_lifespan:
            lifespan_status = "life_exhausted"
            xp_blocked = True
        elif cultivation.platform_age_years >= int(0.8 * realm.max_lifespan):
            lifespan_status = "life_warning"
        else:
            lifespan_status = "normal"

    return {
        "user": {
            "username": user.username,
            "email": user.email,
        },
        "realm": {
            "name": realm.name,
            "level": cultivation.realm_level,
            "intro": realm.intro_text,
            "title": realm.title,
        },
        "progression": {
            "sub_level": cultivation.sub_level,
            "stage": stage_name(cultivation.sub_level),
            "current_xp": cultivation.current_xp,
            "required_xp": required_xp,
            "xp_percent": xp_percent,
            "total_xp": cultivation.total_xp,
        },
        "age": {
            "platform_age": cultivation.platform_age_years,
            "max_lifespan": realm.max_lifespan,
            "status": lifespan_status,
        },
        "xp_blocked": xp_blocked,
        "next_goal": (
            "Breakthrough required"
            if cultivation.sub_level == 9
            else f"Reach sublevel {cultivation.sub_level + 1}"
        ),
    }
