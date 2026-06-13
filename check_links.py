import os
import re

src_dir = r"c:\Users\wsric\iscrev\src"
html_files = [f for f in os.listdir(src_dir) if f.endswith('.html')]

missing_xboard = []
broken_links = []

for file in html_files:
    file_path = os.path.join(src_dir, file)
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    if 'href="xboard/index.html"' not in content and 'href="/xboard/index.html"' not in content and 'xboard' not in content.lower():
        missing_xboard.append(file)
        
    links = re.findall(r'href="([^"]+)"', content)
    for link in links:
        if link.startswith('http') or link.startswith('mailto:') or link.startswith('tel:') or link.startswith('#'):
            continue
        
        link_path = link.split('?')[0].split('#')[0]
        if not link_path:
            continue
            
        if link_path.startswith('/'):
            target_file = os.path.join(src_dir, link_path.lstrip('/'))
        else:
            target_file = os.path.join(src_dir, link_path)
            
        if not os.path.exists(target_file):
            broken_links.append((file, link))

print("Missing xboard link in:")
for m in missing_xboard:
    print(" -", m)

print("\nBroken links:")
for f, l in broken_links:
    print(f" - {f} -> {l}")
