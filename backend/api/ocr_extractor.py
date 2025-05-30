import pytesseract
import cv2
import numpy as np
from PIL import Image, ImageEnhance
from typing import List, Dict
import re
import requests

class EnhancedTextExtractor:
    def __init__(self):
        self.url_pattern = re.compile(
            r'https?://[^\s]+|(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?|youtu\.be/[a-zA-Z0-9_-]+'
        )

    def _load_image(self, image_source: str):
        """Load image from URL or local file path"""
        if image_source.startswith(('http://', 'https://')):
            # Download image from URL
            headers = {'User-Agent': 'Mozilla/5.0'}
            try:
                response = requests.get(image_source, headers=headers, timeout=10)
                response.raise_for_status()
                image_content = np.frombuffer(response.content, dtype=np.uint8)
                img = cv2.imdecode(image_content, cv2.IMREAD_COLOR)
                if img is None:
                    raise ValueError("Failed to decode image from URL")
                return img
            except Exception as e:
                raise ValueError(f"Error downloading image: {str(e)}")
        else:
            # Load from local path
            img = cv2.imread(image_source)
            if img is None:
                raise ValueError(f"Could not load image from {image_source}")
            return img

    def aggressive_preprocess_image(self, image_source: str):
        img = self._load_image(image_source)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(img_rgb)
        processed_images = {'original': img_rgb}

        # High contrast and sharpness
        enhancer = ImageEnhance.Contrast(pil_img)
        high_contrast = enhancer.enhance(3.0)
        enhancer = ImageEnhance.Sharpness(high_contrast)
        sharp_img = enhancer.enhance(2.5)
        processed_images['high_contrast_sharp'] = np.array(sharp_img)

        # Upscaling
        height, width = img.shape[:2]
        upscaled = cv2.resize(img, (width * 3, height * 3), interpolation=cv2.INTER_CUBIC)
        processed_images['upscaled_3x'] = cv2.cvtColor(upscaled, cv2.COLOR_BGR2RGB)

        return processed_images

    def extract_urls(self, image_source: str):
        processed_images = self.aggressive_preprocess_image(image_source)
        all_urls = set()

        tesseract_configs = [
            '--psm 3', '--psm 6', '--psm 7', '--psm 8', '--psm 11', '--psm 13'
        ]

        for img in processed_images.values():
            for config in tesseract_configs:
                try:
                    text = pytesseract.image_to_string(img, config=config)
                    urls = self.url_pattern.findall(text)
                    all_urls.update(urls)
                except Exception:
                    continue
                    
        return list(all_urls)

def add_http_prefix(url):
    if not url.startswith(('http://', 'https://')):
        return f"https://{url}"
    return url

def validate_url(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        title_match = re.search(r"<title>(.*?)</title>", response.text, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else "No title found"
        return {'url': url, 'title': title}
    except requests.RequestException:
        return None

def extract_valid_urls(image_source: str) -> List[Dict[str, str]]:
    extractor = EnhancedTextExtractor()
    raw_urls = extractor.extract_urls(image_source)
    validated_urls = []
    
    for url in raw_urls:
        full_url = add_http_prefix(url)
        result = validate_url(full_url)
        if result:
            validated_urls.append(result)
            
    return validated_urls