

# Create your models here.
from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class Post(models.Model):
    POST_TYPE = (
        ('USER', 'User'),
        ('SYSTEM', 'System'),
    )

    VISIBILITY = (
        ('PUBLIC', 'Public'),
        ('FRIENDS', 'Friends'),
    )

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    post_type = models.CharField(max_length=10, choices=POST_TYPE)
    visibility = models.CharField(max_length=10, choices=VISIBILITY)
    created_at = models.DateTimeField(auto_now_add=True)
