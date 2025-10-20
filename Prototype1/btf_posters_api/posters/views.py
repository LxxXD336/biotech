# posters/views.py
import os
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied

from .models import Poster
from .serializers import PosterSerializer

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "biotech")

class PosterViewSet(viewsets.ModelViewSet):
    serializer_class = PosterSerializer
    queryset = Poster.objects.all().order_by("-year", "-id")
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # 避免跨域下 DELETE/POST 要求 CSRF

    def _check_admin(self, request):
        key = request.headers.get("X-Admin-Key") or request.META.get("HTTP_X_ADMIN_KEY")
        if key != ADMIN_PASSWORD:
            raise PermissionDenied("invalid admin key")

    # ✅ 这次在类里：只有 list 才按需过滤，其它动作用完整 queryset
    def get_queryset(self):
        base = Poster.objects.all().order_by("-year", "-id")
        if getattr(self, "action", None) == "list":
            include_hidden = self.request.query_params.get("include_hidden")
            if include_hidden in ("1", "true", "True", "yes"):
                return base
            return base.filter(hidden=False)
        return base

    def perform_create(self, serializer):
        self._check_admin(self.request)
        serializer.save()

    def perform_update(self, serializer):
        self._check_admin(self.request)
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        self._check_admin(request)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def hide(self, request, pk=None):
        self._check_admin(request)
        obj = self.get_object()
        obj.hidden = True
        obj.save(update_fields=["hidden"])
        return Response({"status": "hidden"})

    @action(detail=True, methods=["post"])
    def unhide(self, request, pk=None):
        self._check_admin(request)
        obj = self.get_object()
        obj.hidden = False
        obj.save(update_fields=["hidden"])
        return Response({"status": "visible"})
