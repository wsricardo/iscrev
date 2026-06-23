import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, 'src')
DOCS_DIR = os.path.join(BASE_DIR, 'docs')

en_files = {
    'index.html': 'pt.html',
    'about.html': 'sobre.html',
    'contact.html': 'contato.html',
    'privacy.html': 'privacidade.html'
}

pt_files = {
    'pt.html': 'index.html',
    'sobre.html': 'about.html',
    'contato.html': 'contact.html',
    'privacidade.html': 'privacy.html'
}

for target_dir in [SRC_DIR, DOCS_DIR]:
    def fix_en_file(filename, pt_equivalent):
        filepath = os.path.join(target_dir, filename)
        if not os.path.exists(filepath): return
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix nav-menu
        content = re.sub(r'href="pt\.html"(.*?>Home<)', r'href="index.html"\1', content)
        content = re.sub(r'href="sobre\.html"(.*?>About<)', r'href="about.html"\1', content)
        
        # Fix Blog Link
        content = re.sub(r'href="/pt/blog/"', r'href="/blog/"', content)
        
        # Fix Support Link
        content = re.sub(r'href="support\.html"(.*?>Support<)', r'href="support.html?lang=en"\1', content)
        
        # Fix Diario
        content = re.sub(r'href="diario\.html"(.*?>Open diary<)', r'href="diario.html?lang=en"\1', content)

        # Fix Language Switcher
        content = re.sub(r'<a class="lang-link active" href="[^"]*".*?>EN</a>', f'<a class="lang-link active" href="{filename}" aria-current="page">EN</a>', content)
        content = re.sub(r'<a class="lang-link" href="[^"]*".*?>PT</a>', f'<a class="lang-link" href="{pt_equivalent}">PT</a>', content)

        lang_switcher_pattern = r'<div class="lang-switcher" aria-label="Switch language">\s*<a class="lang-link[^>]*>EN</a>\s*<a class="lang-link[^>]*>PT</a>\s*</div>'
        new_lang_switcher = f'<div class="lang-switcher" aria-label="Switch language">\n                            <a class="lang-link active" href="{filename}" aria-current="page">EN</a>\n                            <a class="lang-link" href="{pt_equivalent}">PT</a>\n                        </div>'
        content = re.sub(lang_switcher_pattern, new_lang_switcher, content, flags=re.DOTALL)

        # Fix Logo
        content = re.sub(r'<a class="logo" href="[^"]*"(.*?>)', r'<a class="logo" href="index.html"\1', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)


    def fix_pt_file(filename, en_equivalent):
        filepath = os.path.join(target_dir, filename)
        if not os.path.exists(filepath): return
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        content = re.sub(r'href="index\.html"(.*?>Início<)', r'href="pt.html"\1', content)
        content = re.sub(r'href="about\.html"(.*?>Sobre<)', r'href="sobre.html"\1', content)
        
        # Fix Blog Link
        content = re.sub(r'href="/blog/"(.*?>Blog<)', r'href="/pt/blog/"\1', content)
        
        # Fix Support Link (remove ?lang=en if it exists)
        content = re.sub(r'href="support\.html\?lang=en"(.*?>Apoie<)', r'href="support.html"\1', content)
        
        # Fix Diario
        content = re.sub(r'href="diario\.html\?lang=en"(.*?>Abrir diário<)', r'href="diario.html"\1', content)

        # Fix Language Switcher
        lang_switcher_pattern = r'<div class="lang-switcher" aria-label="Alternar idioma">\s*<a class="lang-link[^>]*>EN</a>\s*<a class="lang-link[^>]*>PT</a>\s*</div>'
        new_lang_switcher = f'<div class="lang-switcher" aria-label="Alternar idioma">\n                            <a class="lang-link" href="{en_equivalent}">EN</a>\n                            <a class="lang-link active" href="{filename}" aria-current="page">PT</a>\n                        </div>'
        content = re.sub(lang_switcher_pattern, new_lang_switcher, content, flags=re.DOTALL)

        # Fix Logo
        content = re.sub(r'<a class="logo" href="[^"]*"(.*?>)', r'<a class="logo" href="pt.html"\1', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    for en, pt in en_files.items():
        fix_en_file(en, pt)

    for pt, en in pt_files.items():
        fix_pt_file(pt, en)

print("Links fixed.")
