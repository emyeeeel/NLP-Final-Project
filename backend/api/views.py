from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import TwitterScraper


@api_view(['POST'])
def scrape_tweet(request):
    """
    API endpoint to scrape tweet content
    
    Expected JSON body:
    {
        "url": "https://x.com/username/status/1234567890"
    }
    """
    try:
        url = request.data.get('url')
        
        if not url:
            return Response(
                {'error': 'URL is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        scraper = TwitterScraper()
        content = scraper.get_tweet_content(url)
        
        if content is None:
            return Response(
                {'error': 'Failed to extract tweet content. Please check if the URL is valid.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'success': True,
            'data': content
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def scrape_tweet_get(request):
    """
    Alternative GET endpoint to scrape tweet content
    
    Usage: GET /api/scrape-tweet/?url=https://x.com/username/status/1234567890
    """
    try:
        url = request.GET.get('url')
        
        if not url:
            return Response(
                {'error': 'URL parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        scraper = TwitterScraper()
        content = scraper.get_tweet_content(url)
        
        if content is None:
            return Response(
                {'error': 'Failed to extract tweet content. Please check if the URL is valid.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'success': True,
            'data': content
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.url_extractor import extract_urls

class ExtractUrlsView(APIView):
    """
    API endpoint to extract URLs from the provided text.
    """
    def post(self, request, *args, **kwargs):
        text = request.data.get("text", "")
        if not text:
            return Response({"error": "Text field is required"}, status=status.HTTP_400_BAD_REQUEST)

        urls = extract_urls(text)
        return Response({"urls": urls}, status=status.HTTP_200_OK)