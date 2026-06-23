import os
import re

directories = [r"c:\Users\wsric\iscrev\src", r"c:\Users\wsric\iscrev\docs"]
en_link = '<li><a class="nav-link" href="xboard/index.html" target="_blank">XBoard App</a></li>'
pt_link = '<li><a class="nav-link" href="xboard/index.html" target="_blank">Lousa XBoard</a></li>'

for target_dir in directories:
    if not os.path.exists(target_dir):
        continue
    html_files = [f for f in os.listdir(target_dir) if f.endswith('.html')]
    for file in html_files:
        file_path = os.path.join(target_dir, file)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if file == 'support.html' and '<meta name="description"' not in content:
            # Replaces the whole tag safely without leaving orphans
            content = re.sub(
                r'<meta name="viewport" content="width=device-width, initial-scale=1\.0">', 
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta name="description" content="Support iScrev Notes project. Learn how you can contribute, report issues or provide feedback.">', 
                content, 
                count=1
            )

        if file == 'index.html':
            content = content.replace('href="en.html"', 'href="index.html"')

        if 'xboard/index.html' not in content:
            is_pt = file in ['pt.html', 'sobre.html', 'contato.html', 'diario.html', 'privacidade.html']
            link_to_add = pt_link if is_pt else en_link
            
            nav_pattern = r'(<ul class="nav-menu">.*?)(\s*</ul>)'
            match = re.search(nav_pattern, content, re.DOTALL)
            if match:
                new_nav = match.group(1) + '\n                        ' + link_to_add + match.group(2)
                content = content.replace(match.group(0), new_nav)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("SEO updates applied to src and docs.")
