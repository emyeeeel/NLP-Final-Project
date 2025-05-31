import pytesseract
import cv2
import numpy as np
from PIL import Image, ImageEnhance
from typing import List, Dict, Tuple
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

    def extract_text_and_urls(self, image_source: str) -> Tuple[List[str], str]:
        """Extract both URLs and raw text from image"""
        processed_images = self.aggressive_preprocess_image(image_source)
        all_urls = set()
        unique_text_lines = set()
        best_text = ""
        max_text_length = 0

        tesseract_configs = [
            '--psm 3', '--psm 6', '--psm 7', '--psm 8', '--psm 11', '--psm 13'
        ]

        for img_name, img in processed_images.items():
            for config in tesseract_configs:
                try:
                    text = pytesseract.image_to_string(img, config=config)
                    if text.strip():
                        # Find URLs in this text
                        urls = self.url_pattern.findall(text)
                        all_urls.update(urls)
                        
                        # Keep track of the longest/best text extraction
                        if len(text.strip()) > max_text_length:
                            max_text_length = len(text.strip())
                            best_text = text.strip()
                        
                        # Also collect unique lines for fallback
                        lines = [line.strip() for line in text.split('\n') if line.strip()]
                        unique_text_lines.update(lines)
                        
                except Exception:
                    continue

        # Use the best (longest) text extraction, or fall back to unique lines
        if best_text:
            final_text = best_text
        else:
            # Sort lines to maintain some consistency
            sorted_lines = sorted(unique_text_lines, key=len, reverse=True)
            final_text = '\n'.join(sorted_lines)

        # Clean up the text
        final_text = re.sub(r'\n\s*\n+', '\n\n', final_text)  # Remove excessive line breaks
        final_text = re.sub(r' +', ' ', final_text)  # Remove excessive spaces
        final_text = re.sub(r'\n +', '\n', final_text)  # Remove spaces at start of lines

        return list(all_urls), final_text.strip()

    def extract_urls(self, image_source: str):
        """Keep the original method for backward compatibility"""
        urls, _ = self.extract_text_and_urls(image_source)
        return urls

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

def extract_valid_urls_and_text(image_source: str) -> Dict[str, any]:
    """Extract both validated URLs and raw text from image"""
    extractor = EnhancedTextExtractor()
    raw_urls, raw_text = extractor.extract_text_and_urls(image_source)
    validated_urls = []

    for url in raw_urls:
        full_url = add_http_prefix(url)
        result = validate_url(full_url)
        if result:
            validated_urls.append(result)

    return {
        'urls': validated_urls,
        'raw_text': raw_text
    }

def extract_valid_urls(image_source: str) -> List[Dict[str, str]]:
    """Keep the original function for backward compatibility"""
    result = extract_valid_urls_and_text(image_source)
    return result['urls']