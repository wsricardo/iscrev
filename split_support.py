import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, 'src')
support_js_path = os.path.join(SRC_DIR, 'assets', 'js', 'support.js')
support_html_path = os.path.join(SRC_DIR, 'support.html')

with open(support_js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

def parse_dict(js_str, lang_key):
    # Extract the block for the language
    # Simplistic regex to find the lang block
    pattern = rf'{lang_key}:\s*{{(.*?)\n  }}'
    match = re.search(pattern, js_content, re.DOTALL)
    if not match:
        return {}
    block = match.group(1)
    
    result = {}
    for line in block.split('\n'):
        # match 'key': 'value'
        m = re.search(r"^\s*'([^']+)':\s*'(.*)',?$", line)
        if m:
            result[m.group(1)] = m.group(2).replace("\\'", "'")
    return result

pt_dict = parse_dict(js_content, 'pt')
en_dict = parse_dict(js_content, 'en')

with open(support_html_path, 'r', encoding='utf-8') as f:
    base_html = f.read()

def apply_translations(html, dictionary):
    # replace data-i18n
    def replacer(match):
        key = match.group(1)
        if key in dictionary:
            return f'data-i18n="{key}">{dictionary[key]}</'
        return match.group(0)
    html = re.sub(r'data-i18n="([^"]+)">.*?</', replacer, html, flags=re.DOTALL)
    
    # replace data-i18n-html
    def replacer_html(match):
        key = match.group(1)
        if key in dictionary:
            return f'data-i18n-html="{key}">{dictionary[key]}</'
        return match.group(0)
    html = re.sub(r'data-i18n-html="([^"]+)">.*?</', replacer_html, html, flags=re.DOTALL)
    
    # replace placeholders
    def replacer_input(match):
        key = match.group(1)
        if key in dictionary:
            return f'data-i18n="{key}" placeholder="{dictionary[key]}"'
        return match.group(0)
    html = re.sub(r'data-i18n="([^"]+)"\s+placeholder="[^"]*"', replacer_input, html)
    
    return html

# CREATE EN HTML
en_html = apply_translations(base_html, en_dict)
en_html = en_html.replace('lang="pt-BR"', 'lang="en"')
en_html = en_html.replace('page-pt', 'page-en')

# Fix language switcher in EN
en_lang_switcher = '''<div class="lang-switcher" aria-label="Switch language">
<a class="lang-link active" id="langEn" href="support.html" aria-current="page">EN</a>
<a class="lang-link" id="langPt" href="apoio.html">PT</a>
                        </div>'''
en_html = re.sub(r'<div class="lang-switcher"[^>]*>.*?</div>', en_lang_switcher, en_html, flags=re.DOTALL)

# Fix nav links for EN
en_html = en_html.replace('href="pt.html"', 'href="index.html"')
en_html = en_html.replace('href="sobre.html"', 'href="about.html"')
en_html = en_html.replace('href="contato.html"', 'href="contact.html"')
en_html = en_html.replace('href="/pt/blog/"', 'href="/blog/"')

# Fix meta tags or any residual Portuguese
en_html = en_html.replace('content="pt_BR"', 'content="en_US"')
en_html = en_html.replace('content="en_US"', 'content="pt_BR"', 1) # wait, alternate should be pt_BR
en_html = re.sub(r'og:locale" content="[^"]*"', 'og:locale" content="en_US"', en_html)
en_html = re.sub(r'og:locale:alternate" content="[^"]*"', 'og:locale:alternate" content="pt_BR"', en_html)

# CREATE PT HTML
pt_html = apply_translations(base_html, pt_dict)
pt_html = pt_html.replace('lang="en"', 'lang="pt-BR"')
pt_html = pt_html.replace('page-en', 'page-pt')

# Fix language switcher in PT
pt_lang_switcher = '''<div class="lang-switcher" aria-label="Alternar idioma">
<a class="lang-link" id="langEn" href="support.html">EN</a>
<a class="lang-link active" id="langPt" href="apoio.html" aria-current="page">PT</a>
                        </div>'''
pt_html = re.sub(r'<div class="lang-switcher"[^>]*>.*?</div>', pt_lang_switcher, pt_html, flags=re.DOTALL)

# Fix nav links for PT
pt_html = pt_html.replace('href="index.html"', 'href="pt.html"')
pt_html = pt_html.replace('href="about.html"', 'href="sobre.html"')
pt_html = pt_html.replace('href="contact.html"', 'href="contato.html"')
pt_html = pt_html.replace('href="/blog/"', 'href="/pt/blog/"')
# Re-fix logo link so it always points to pt.html in PT and index.html in EN
pt_html = re.sub(r'<a class="logo" [^>]*href="[^"]*"', '<a class="logo" id="brandLink" href="pt.html"', pt_html)
en_html = re.sub(r'<a class="logo" [^>]*href="[^"]*"', '<a class="logo" id="brandLink" href="index.html"', en_html)

# Meta locales for PT
pt_html = re.sub(r'og:locale" content="[^"]*"', 'og:locale" content="pt_BR"', pt_html)
pt_html = re.sub(r'og:locale:alternate" content="[^"]*"', 'og:locale:alternate" content="en_US"', pt_html)

with open(os.path.join(SRC_DIR, 'support.html'), 'w', encoding='utf-8') as f:
    f.write(en_html)

with open(os.path.join(SRC_DIR, 'apoio.html'), 'w', encoding='utf-8') as f:
    f.write(pt_html)

print("Generated support.html and apoio.html")
