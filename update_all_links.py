import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

directories_to_scan = [
    os.path.join(BASE_DIR, 'src'),
    os.path.join(BASE_DIR, 'docs')
]

english_files = ['index.html', 'about.html', 'contact.html', 'support.html', 'diario.html']
portuguese_files = ['pt.html', 'sobre.html', 'contato.html', 'apoio.html']

for d in directories_to_scan:
    for root, dirs, files in os.walk(d):
        for file in files:
            if not file.endswith('.html'):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            is_english = False
            is_portuguese = False
            
            if file in english_files:
                is_english = True
            elif file in portuguese_files:
                is_portuguese = True
            elif 'blog' in root.lower() and 'pt' in root.lower():
                is_portuguese = True
            elif 'blog' in root.lower():
                is_english = True
            else:
                # heuristic
                if 'lang="pt-BR"' in content:
                    is_portuguese = True
                else:
                    is_english = True
            
            # For portuguese files, replace support.html and support.html?lang=en with apoio.html
            # wait, if it's already apoio.html we don't need to change it, except maybe inside its own language switcher.
            # But the language switcher explicitly has href="support.html" for EN and href="apoio.html" for PT.
            # So we only want to replace support link in the nav menus and footer.
            
            if is_portuguese and file != 'apoio.html' and file != 'support.html':
                content = re.sub(r'href="support\.html(\?lang=[^"]+)?"', 'href="apoio.html"', content)
                # also href="/support.html"
                content = re.sub(r'href="/support\.html(\?lang=[^"]+)?"', 'href="/apoio.html"', content)
            
            if is_english and file != 'support.html' and file != 'apoio.html':
                content = re.sub(r'href="support\.html(\?lang=[^"]+)?"', 'href="support.html"', content)
                content = re.sub(r'href="/support\.html(\?lang=[^"]+)?"', 'href="/support.html"', content)
            
            # also fix blog index links if any?
            # actually the above should catch them.
            
            if original_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated links in {filepath}")
