# btf_api/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from posters.views import PosterViewSet   # ⬅️ 这里从 app 导入（把 posters 换成你的 app 名）

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'posters', PosterViewSet, basename='poster')

urlpatterns = [
                  path('admin/', admin.site.urls),
                  path('api/', include(router.urls)),
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
