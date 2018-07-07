import os
from pathlib import Path

CACHE_DIR = Path(os.getcwd()) / '.cache'

THUMBNAIL_DIR = CACHE_DIR / 'thumbnails'
SMALL_THUMBNAIL_DIR = CACHE_DIR / 'thumbnails'
