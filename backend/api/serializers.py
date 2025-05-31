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
    

class URLSerializer(serializers.Serializer):
    url = serializers.URLField(required=True)

class BatchURLSerializer(serializers.Serializer):
    urls = serializers.ListField(
        child=serializers.URLField(),
        required=True
    )

from rest_framework import serializers

class ImageInputSerializer(serializers.Serializer):
    image_url = serializers.URLField(required=False)
    image_file = serializers.ImageField(required=False)
    include_raw_text = serializers.BooleanField(required=False, default=False)

    def validate(self, data):
        if not data.get('image_url') and not data.get('image_file'):
            raise serializers.ValidationError("Either 'image_url' or 'image_file' must be provided.")
        return data