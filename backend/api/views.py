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
    
from .services import InstagramProfileAnalyzer

class AnalyzeInstagramProfileView(APIView):
    def post(self, request):
        """
        Analyze Instagram profile for fake account detection
        Required fields: username, followers, following
        Optional fields: bio, is_private, is_joined_recently, 
                        has_channel, is_business_account
        """
        try:
         
            required_fields = ['username', 'followers', 'following']
            for field in required_fields:
                if field not in request.data:
                    return Response(
                        {'error': f'Missing required field: {field}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

            analyzer = InstagramProfileAnalyzer()
            result = analyzer.analyze_profile(request.data)
            
            if result['success']:
                return Response(result, status=status.HTTP_200_OK)
            return Response(
                {'error': result['error']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import joblib
import os
from .serializers import URLSerializer, BatchURLSerializer

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'trained_models', 'url_classifier_artifacts.joblib')

def get_risk_assessment(prob):
    """Get risk level, corresponding warning message, and remove color coding"""
    if prob >= 0.8:
        return {
            'risk_level': 'HIGH',
            'prediction': 'MALICIOUS',
            'warning': 'DANGER: High risk of malicious content! Do not visit this URL.',
            'recommendation': 'Block this URL immediately. Likely contains malware, phishing, or other threats.'
        }
    elif prob >= 0.6:
        return {
            'risk_level': 'MEDIUM-HIGH',
            'prediction': 'MALICIOUS',
            'warning': 'WARNING: Medium-high risk detected. Exercise extreme caution.',
            'recommendation': 'Avoid visiting unless absolutely necessary. Scan with security tools first.'
        }
    elif prob >= 0.4:
        return {
            'risk_level': 'MEDIUM',
            'prediction': 'BENIGN',
            'warning': 'CAUTION: Medium risk detected. Proceed with caution.',
            'recommendation': 'Use additional security measures. Verify the URL source before visiting.'
        }
    elif prob >= 0.2:
        return {
            'risk_level': 'LOW-MEDIUM',
            'prediction': 'BENIGN',
            'warning': 'NOTICE: Some suspicious indicators found.',
            'recommendation': 'Generally safe but monitor for unusual behavior. Keep security tools active.'
        }
    else:
        return {
            'risk_level': 'LOW',
            'prediction': 'BENIGN',
            'warning': 'SAFE: Low risk detected. URL appears legitimate.',
            'recommendation': 'URL appears safe to visit. Normal security precautions apply.'
        }

class SingleURLRiskAssessmentView(APIView):
    def post(self, request):
        serializer = URLSerializer(data=request.data)
        if serializer.is_valid():
            url = serializer.validated_data['url']
            artifacts = joblib.load(MODEL_PATH)
            X = artifacts['vectorizer'].transform([url])
            prob = artifacts['model'].predict_proba(X)[0, 1]
            assessment = get_risk_assessment(prob)
            return Response({
                'url': url,
                'malicious_probability': prob,
                'risk_level': assessment['risk_level'],
                'prediction': assessment['prediction'],
                'warning': assessment['warning'],
                'recommendation': assessment['recommendation']
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BatchURLRiskAssessmentView(APIView):
    def post(self, request):
        serializer = BatchURLSerializer(data=request.data)
        if serializer.is_valid():
            urls = serializer.validated_data['urls']
            artifacts = joblib.load(MODEL_PATH)
            X = artifacts['vectorizer'].transform(urls)
            probs = artifacts['model'].predict_proba(X)[:, 1]
            results = []
            for url, prob in zip(urls, probs):
                assessment = get_risk_assessment(prob)
                results.append({
                    'url': url,
                    'malicious_probability': prob,
                    'risk_level': assessment['risk_level'],
                    'prediction': assessment['prediction'],
                    'warning': assessment['warning'],
                    'recommendation': assessment['recommendation']
                })
            return Response(results, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ImageInputSerializer
from .ocr_extractor import extract_valid_urls_and_text, extract_valid_urls  # Import both functions
import os

class OCRExtractionView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ImageInputSerializer(data=request.data)
        if serializer.is_valid():
            image_url = serializer.validated_data.get('image_url')
            image_file = serializer.validated_data.get('image_file')
            
            # Check if raw_text is requested from validated data
            include_raw_text = serializer.validated_data.get('include_raw_text', False)

            if image_url:
                image_source = image_url
            elif image_file:
                # Save the uploaded file temporarily
                temp_file_path = f"/tmp/{image_file.name}"
                with open(temp_file_path, 'wb') as temp_file:
                    temp_file.write(image_file.read())
                image_source = temp_file_path

            try:
                if include_raw_text:
                    # Use the new function that returns both URLs and raw text
                    result = extract_valid_urls_and_text(image_source)
                    response_data = {
                        'urls': result['urls'],
                        'raw_text': result['raw_text']
                    }
                else:
                    # Use the original function for backward compatibility
                    urls_with_titles = extract_valid_urls(image_source)
                    response_data = {'urls': urls_with_titles}
                
                if image_file:
                    os.remove(image_source)  # Clean up temporary file
                
                return Response(response_data, status=status.HTTP_200_OK)
            except Exception as e:
                if image_file and os.path.exists(image_source):
                    os.remove(image_source)  # Clean up on error
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)