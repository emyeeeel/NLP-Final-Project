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

