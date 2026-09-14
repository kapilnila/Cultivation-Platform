import os

from celery import shared_task
import google.generativeai as genai

from cultivation.models import UserCultivation, Realm, CultivationLore


genai.configure(
    api_key=os.environ.get("GEMINI_API_KEY")
)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=10,
    time_limit=30,
)
def generate_cultivation_lore(
    self,
    user_id,
    realm_level,
):
    try:
        user_cult = UserCultivation.objects.select_related(
            "user"
        ).get(user_id=user_id)

        realm = Realm.objects.get(
            realm_level=realm_level
        )

        prompt = f"""
Write a short 3-sentence cultivation breakthrough chronicle.

Realm: {realm.name}
Realm Level: {realm_level}
Realm Title: {realm.title}

Tone:
- cinematic
- dark fantasy
- epic
- concise

Do not mention AI or game mechanics.
"""

        model = genai.GenerativeModel(
            "gemini-1.5-flash"
        )

        response = model.generate_content(prompt)

        story_text = response.text.strip()

        CultivationLore.objects.create(
            user=user_cult.user,
            realm=realm,
            text=story_text,
        )

        return {
            "status": "success",
            "user_id": user_id,
            "realm_level": realm_level,
        }

    except Exception as exc:
        raise self.retry(exc=exc)
