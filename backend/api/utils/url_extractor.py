import re
from typing import List

def extract_urls(text: str) -> List[str]:
    """
    Extract all URLs/links from the given text input.
    """
    url_pattern = r'''
        (?i)
        (?:
            (?:https?|ftp|ftps|sftp)://
            (?:[^\s<>"{}|\\^`\[\]]+)
            |
            (?:www\.)
            (?:[^\s<>"{}|\\^`\[\]]+)
            |
            (?:
                (?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+
                (?:[a-zA-Z]{2,})
                (?:/[^\s<>"{}|\\^`\[\]]*)?
            )
        )
    '''
    urls = re.findall(url_pattern, text, re.VERBOSE)
    cleaned_urls = [re.sub(r'[.,;:!?]+$', '', url) for url in urls if url]
    return cleaned_urls