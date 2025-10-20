from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.conf import settings

class AdminKeyPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        key = request.headers.get("X-Admin-Key")
        return bool(key and key == getattr(settings, "ADMIN_KEY", ""))
