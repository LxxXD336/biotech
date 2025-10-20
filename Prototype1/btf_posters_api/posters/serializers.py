# posters/serializers.py
from rest_framework import serializers
from .models import Poster

class PosterSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)
    pdf_url   = serializers.SerializerMethodField(read_only=True)

    # 👇 新增：用来接收前端上传（PATCH/POST），不在响应里回传
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    pdf   = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Poster
        fields = [
            "id", "title", "year",
            "award", "type", "area",
            "description",
            "hidden",
            # write-only inputs
            "image", "pdf",
            # read-only outputs
            "image_url", "pdf_url",
        ]

    def get_image_url(self, obj):
        req = self.context.get("request")
        if getattr(obj, "image", None):
            return req.build_absolute_uri(obj.image.url) if req else obj.image.url
        return None

    def get_pdf_url(self, obj):
        req = self.context.get("request")
        if getattr(obj, "pdf", None):
            return req.build_absolute_uri(obj.pdf.url) if req else obj.pdf.url
        return None
