import os
import re

def check_file(html_path):
    print(f'Checking {html_path}')
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    dir_path = os.path.dirname(html_path)
    
    tags = re.findall(r'<(script|link|img)[^>]+(src|href)=\"([^\"]+)\"', content)
    for tag, attr, url in tags:
        if url.startswith('http') or url.startswith('data:'):
            continue
        
        if url.startswith('/'):
            abs_path = os.path.join('c:/Users/wsric/iscrev/src', url[1:])
        else:
            abs_path = os.path.join(dir_path, url)
            
        abs_path = os.path.normpath(abs_path)
        
        if '${' in abs_path:
            continue
            
        if not os.path.exists(abs_path):
            print(f'  MISSING: {url} -> {abs_path}')

for file in ['src/index.html', 'src/pt.html', 'src/diario.html', 'src/xboard/index.html']:
    check_file(f'c:/Users/wsric/iscrev/{file}')
