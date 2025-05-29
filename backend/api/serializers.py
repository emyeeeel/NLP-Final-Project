from rest_framework import serializers

class URLExtractionSerializer(serializers.Serializer):
    text = serializers.CharField()

    def validate_text(self, value):
        if not value:
            raise serializers.ValidationError("Text input cannot be empty.")
        return value

    def extract_urls(self):
        from .utils.url_extractor import extract_urls
        return extract_urls(self.validated_data['text'])