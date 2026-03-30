

# Register your models here.
from django.contrib import admin
from .models import Realm, UserCultivation

admin.site.register(Realm)
admin.site.register(UserCultivation)