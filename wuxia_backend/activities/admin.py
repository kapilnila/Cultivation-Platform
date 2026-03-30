from django.contrib import admin
from .models import ActivityType, XPLog, UserStreak

admin.site.register(ActivityType)
admin.site.register(XPLog)
admin.site.register(UserStreak)