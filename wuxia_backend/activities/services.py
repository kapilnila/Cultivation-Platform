from django.db import transaction

from cultivation.models import UserCultivation, Realm


def grant_xp(user, activity):
    """
    Grant XP and safely handle cultivation progression.

    Row-level locking prevents concurrent requests for the same
    user from overwriting each other's progression.
    """

    xp_to_add = activity.xp_reward

    with transaction.atomic():

        user_cult, created = (
            UserCultivation.objects
            .select_for_update()
            .get_or_create(user=user)
        )

        user_cult.current_xp += xp_to_add
        user_cult.total_xp += xp_to_add

        leveled_up = False
        realm_name = None

        # Handle progression.
        while True:
            try:
                current_realm = Realm.objects.get(
                    realm_level=user_cult.realm_level
                )
            except Realm.DoesNotExist:
                break

            if user_cult.current_xp < current_realm.base_xp:
                break

            try:
                next_realm = Realm.objects.get(
                    realm_level=user_cult.realm_level + 1
                )
            except Realm.DoesNotExist:
                # Already at the highest configured realm.
                break

            user_cult.current_xp -= current_realm.base_xp
            user_cult.realm_level += 1
            user_cult.sub_level = 1

            leveled_up = True
            realm_name = next_realm.name

        user_cult.save(
            update_fields=[
                "current_xp",
                "total_xp",
                "realm_level",
                "sub_level",
            ]
        )

        return {
            "xp_added": xp_to_add,
            "new_xp": user_cult.current_xp,
            "total_xp": user_cult.total_xp,
            "realm_level": user_cult.realm_level,
            "sub_level": user_cult.sub_level,
            "leveled_up": leveled_up,
            "realm_name": realm_name,
        }
