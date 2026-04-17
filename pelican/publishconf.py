import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

# A URL final do seu site.
SITEURL = 'https://www.iscrev.com'
RELATIVE_URLS = False

# Habilita a geração de feeds para produção.
FEED_ALL_ATOM = 'blog/feeds/all.atom.xml'
CATEGORY_FEED_ATOM = 'blog/feeds/{slug}.atom.xml'

DELETE_OUTPUT_DIRECTORY = False