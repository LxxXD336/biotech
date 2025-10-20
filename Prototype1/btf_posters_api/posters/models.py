from django.db import models

class Poster(models.Model):
    title = models.CharField(max_length=200)
    year = models.IntegerField()
    award = models.CharField(max_length=120, blank=True)
    type = models.CharField(max_length=120, blank=True)
    area = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="posters/images/")
    pdf = models.FileField(upload_to="posters/pdf/", blank=True, null=True)
    hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-year", "-created_at"]

    def __str__(self):
        return f"{self.title} ({self.year})"
