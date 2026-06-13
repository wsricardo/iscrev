import os
import re

src_dir = r"c:\Users\wsric\iscrev\src"
html_files = [f for f in os.listdir(src_dir) if f.endswith('.html')]

for file in html_files:
    file_path = os.path.join(src_dir, file)
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
    
    title = title_match.group(1).strip() if title_match else 'MISSING'
    desc = desc_match.group(1).strip() if desc_match else 'MISSING'
    
    print(f'File: {file}')
    print(f'  Title: {title}')
    print(f'  Desc:  {desc}')
