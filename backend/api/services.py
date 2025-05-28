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

    def get_tweet_content(self, url):
        """Extract tweet content using Twitter's embed API"""
        if not self._is_valid_twitter_url(url):
            return None

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
                if href and not href.startswith('#') and 'twitter.com' not in href and 'x.com' not in href:
                    links.append({
                        'url': href,
                        'text': link.get_text(strip=True)
                    })

            return {
                'text': text,
                'external_links': links,
                'method': 'embed_api'
            }
        except Exception as e:
            print(f"Error parsing embed data: {e}")
            return None