from django.urls import path
from . import views
from .views import ExtractUrlsView, AnalyzeInstagramProfileView

urlpatterns = [
    path('scrape-tweet/', views.scrape_tweet, name='scrape_tweet'),
    path('scrape-tweet-get/', views.scrape_tweet_get, name='scrape_tweet_get'),
    path('extract-urls/', ExtractUrlsView.as_view(), name='extract-urls'),
    path('analyze-instagram-profile/', AnalyzeInstagramProfileView.as_view(), name='analyze_instagram_profile'),    
]