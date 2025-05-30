import requests
import re
import json
from urllib.parse import urlparse
from bs4 import BeautifulSoup


class TwitterScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        })

    def validate_twitter_post_url(self, url):
        """Validate if the input is a valid Twitter post URL"""
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower()
            if ('twitter.com' in domain or 'x.com' in domain) and re.search(r'/status/\d+', url):
                return True
            return False
        except Exception:
            return False

    def validate_twitter_post_url_strict(self, url):
        """Strictly validate if the input is a valid Twitter post URL and not a profile or other URL"""
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower()
            if ('twitter.com' in domain or 'x.com' in domain) and re.search(r'/status/\d+', url):
                return True
            return "Please input a valid Twitter post URL"
        except Exception:
            return "Please input a valid Twitter post URL"

    def get_tweet_content(self, url):
        """Extract tweet content using Twitter's embed API"""
        validation_result = self.validate_twitter_post_url_strict(url)
        if validation_result is not True:
            return {"error": validation_result}

        tweet_id = self._extract_tweet_id(url)
        if not tweet_id:
            return None

        try:
            response = self.session.get(
                f"https://publish.twitter.com/oembed?url={url}&omit_script=true",
                timeout=10
            )
            response.raise_for_status()
            return self._parse_embed_data(response.json())
                    
        except Exception as e:
            print(f"Failed to extract tweet: {e}")
            return None

    def _is_valid_twitter_url(self, url):
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()
        return 'twitter.com' in domain or 'x.com' in domain

    def _extract_tweet_id(self, url):
        match = re.search(r'/status/(\d+)', url)
        return match.group(1) if match else None

    def _parse_embed_data(self, embed_data):
        """Parse data from Twitter's embed API"""
        try:
            soup = BeautifulSoup(embed_data.get('html', ''), 'html.parser')
            text_elem = soup.find('p')
            text = text_elem.get_text(strip=True) if text_elem else ''

            links = []
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                display_text = link.get_text(strip=True)
                
                # Store link info
                links.append({
                    'url': href,
                    'text': display_text
                })
                
                if not display_text:
                    continue  # Skip empty text

                # Escape special characters for regex
                escaped_text = re.escape(display_text)
                
                # Add space before if attached to non-whitespace
                text = re.sub(rf'(\S)({escaped_text})', r'\1 \2', text)
                # Add space after if attached to non-whitespace
                text = re.sub(rf'({escaped_text})(\S)', r'\1 \2', text)

            # Normalize all whitespace sequences
            text = re.sub(r'\s+', ' ', text).strip()
            
            return {
                'text': text,
                'external_links': links,
                'method': 'embed_api'
            }
        except Exception as e:
            print(f"Error parsing embed data: {e}")
            return None

        

import joblib
from pathlib import Path
import nltk
import re
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.util import ngrams


nltk.download('punkt_tab')
nltk.download('stopwords')

class InstagramProfileAnalyzer:
    def __init__(self):
        # Load ML model
        model_path = Path(__file__).parent / 'trained_models' / 'instagram_fake_detector.joblib'
        self.model = joblib.load(model_path)
        
        try:
            
          
            self.stop_words = set(stopwords.words('english'))
            
          
            nltk.data.find('tokenizers/punkt')
            
        except LookupError as e:
            print(f"Error downloading NLTK data: {e}")
           
            self.stop_words = set()
        except Exception as e:
            print(f"Unexpected error initializing NLTK: {e}")
            self.stop_words = set()
        
        # Suspicious patterns for NLP analysis
        self.suspicious_patterns = [
            r'follow\s*back',
            r'f4f',
            r'l4l',
            r'dm\s*for',
            r'buy\s*\d+\s*followers',
            r'instant\s*delivery',
            r'cheap\s*followers'
        ]

    def analyze_text_content(self, text):
        """NLP analysis of text content"""
        if not text:
            return None

        # Tokenization and cleaning
        tokens = word_tokenize(text.lower())
        tokens = [t for t in tokens if t not in self.stop_words]
        
        # N-gram analysis
        bigrams = list(ngrams(tokens, 2))
        
        # Text analysis metrics
        return {
            'token_count': len(tokens),
            'unique_tokens': len(set(tokens)),
            'lexical_diversity': len(set(tokens)) / len(tokens) if tokens else 0,
            'common_bigrams': [' '.join(bg) for bg in bigrams[:3]],
            'has_spam_indicators': self._check_spam_patterns(text)
        }

    def analyze_profile(self, data):
        try:
        
            norm_followers = self.normalize_count(data['followers'])
            norm_following = self.normalize_count(data['following'])
            
            username = data['username']
            username_length = len(username)
            username_has_number = 1 if any(c.isdigit() for c in username) else 0
            
            # Prepare all 12 features for ML model
            features = [
                norm_followers,
                norm_following,
                username_length,
                username_has_number,
                0, 
                0, 
                data.get('is_private', 0),
                data.get('is_joined_recently', 0),
                data.get('has_channel', 0),
                data.get('is_business_account', 0),
                data.get('has_guides', 0),
                data.get('has_external_url', 0)
            ]

            risk_factors = self._calculate_risk_factors(data)

           
            username_analysis = self.analyze_text_content(username)
            bio_analysis = self.analyze_text_content(data.get('bio', ''))
            
          
            prediction = self.model.predict([features])
            probability = self.model.predict_proba([features])
            
            final_risk = self._calculate_final_risk(
                probability[0][1],
                risk_factors,
                username_analysis,
                bio_analysis,
                data
            )

            return {
                'success': True,
                'is_fake': bool(prediction[0]),
                'confidence': float(max(probability[0])),
                'ml_metrics': {
                    'follower_ratio': norm_followers/norm_following if norm_following > 0 else 0,
                    'account_type': 'Private' if data.get('is_private') else 'Public'
                },
                'nlp_analysis': {
                    'username_analysis': username_analysis,
                    'bio_analysis': bio_analysis,
                },
                'risk_assessment': {
                    'overall_risk_level': self._get_risk_level(final_risk),
                    'ml_confidence': float(max(probability[0])),
                    'nlp_indicators': {
                        'username_spam_score': username_analysis['has_spam_indicators'] if username_analysis else 0,
                        'bio_spam_score': bio_analysis['has_spam_indicators'] if bio_analysis else 0
                    }
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
        
    def _calculate_risk_factors(self, data):
        """Calculate initial risk factors"""
        followers = data['followers']
        following = data['following']
        
  
        risk_factors = {
            'follower_ratio': 0,
            'account_properties': 0
        }
        
        # Follower ratio analysis based on account size
        if following > 0:
            ratio = followers / following
            if followers > 1000000:  
                risk_factors['follower_ratio'] = 0.2 if ratio < 0.1 else 0
            elif followers > 10000: 
                risk_factors['follower_ratio'] = 0.5 if ratio < 0.1 else 0.2 if ratio < 0.5 else 0
            else: 
                risk_factors['follower_ratio'] = 0.8 if ratio < 0.1 else 0.4 if ratio < 0.5 else 0

       
        risk_factors['account_properties'] = sum([
            0.3 if data.get('is_private', False) and followers > 1000 else 0,
            0.3 if data.get('is_joined_recently', False) else 0,
            -0.2 if data.get('is_business_account', False) else 0,
            -0.2 if data.get('has_channel', False) else 0
        ])

        return risk_factors    
    
    def _calculate_final_risk(self, ml_prob, risk_factors, username_analysis, bio_analysis, data):
        """Calculate final risk score with all factors"""
        # Base weights
        weights = {
            'ml_model': 0.6,
            'follower_ratio': 0.15,
            'account_properties': 0.15,
            'text_analysis': 0.1
        }

        # Adjust weights for high-profile accounts
        if data['followers'] > 1000000:
            weights['ml_model'] = 0.4
            weights['follower_ratio'] = 0.1
            weights['account_properties'] = 0.3
            weights['text_analysis'] = 0.2

 
        text_risk = (
            (username_analysis['has_spam_indicators'] if username_analysis else 0) +
            (bio_analysis['has_spam_indicators'] if bio_analysis else 0)
        ) / (len(self.suspicious_patterns) * 2)

        # Final weighted score
        final_risk = (
            ml_prob * weights['ml_model'] +
            risk_factors['follower_ratio'] * weights['follower_ratio'] +
            risk_factors['account_properties'] * weights['account_properties'] +
            text_risk * weights['text_analysis']
        )

        return final_risk

    def _check_spam_patterns(self, text):
        """Check text for suspicious patterns"""
        return sum(bool(re.search(pattern, text.lower())) for pattern in self.suspicious_patterns)
    
    def normalize_count(self, count):
        """Normalize count to match training data scale"""
        MAX_COUNT = 100000
        return float(count) / MAX_COUNT

    # def _calculate_combined_risk(self, ml_prob, username_risk, bio_risk):
    #     """Calculate combined risk score from ML and NLP analysis"""
    #     # Weight ML prediction more heavily (70%)
    #     ml_weight = 0.7
    #     nlp_weight = 0.3
        
    #     # Normalize NLP risks to 0-1 scale
    #     max_spam_indicators = len(self.suspicious_patterns)
    #     normalized_username_risk = min(username_risk / max_spam_indicators, 1)
    #     normalized_bio_risk = min(bio_risk / max_spam_indicators, 1)
        
    #     # Combined NLP risk
    #     nlp_risk = (normalized_username_risk + normalized_bio_risk) / 2
        
    #     # Final weighted score
    #     return (ml_prob * ml_weight) + (nlp_risk * nlp_weight)

    def normalize_count(self, count):
        """Normalize count to match training data scale"""
        MAX_COUNT = 100000
        return float(count) / MAX_COUNT

    def _get_risk_level(self, risk_score):
        """Determine risk level based on combined score"""
        if risk_score > 0.8:
            return 'High'
        elif risk_score > 0.5:
            return 'Medium'
        return 'Low'
