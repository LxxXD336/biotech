from django.contrib import admin
from .models import Poster

@admin.register(Poster)
class PosterAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "year", "award", "type", "area", "hidden", "created_at")
    list_filter = ("year", "award", "type", "area", "hidden")
    search_fields = ("title", "description")
