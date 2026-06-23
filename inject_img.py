import os, re

files = [
    r'c:\Users\wsric\iscrev\src\index.html',
    r'c:\Users\wsric\iscrev\docs\index.html',
    r'c:\Users\wsric\iscrev\src\pt.html',
    r'c:\Users\wsric\iscrev\docs\pt.html'
]

img_tag_en = '\n                    <img src="assets/img/hero_tablet_user.png" alt="Black woman using iScrev Notes on a tablet" style="width: 100%; max-width: 500px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: block;">'

img_tag_pt = '\n                    <img src="assets/img/hero_tablet_user.png" alt="Mulher negra usando o iScrev Notes em um tablet" style="width: 100%; max-width: 500px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: block;">'

for filepath in files:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'hero_tablet_user.png' in content:
        continue
    img_tag = img_tag_pt if 'pt.html' in filepath else img_tag_en
    
    # We want to insert it after the hero-lead paragraph inside hero-copy
    # Let's find: <p class="hero-lead">[anything]</p>
    pattern = r'(<p class="hero-lead">.*?</p>)'
    # ensure it only replaces the first occurrence (which is the one in hero-copy)
    content = re.sub(pattern, r'\1' + img_tag, content, count=1, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {filepath}')
