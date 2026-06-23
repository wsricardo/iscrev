import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

img_src = r'C:\Users\wsric\.gemini\antigravity\brain\8da50951-0251-4db0-bf7f-dde16391709d\modal_bus_reader_1782224348897.png'

# Copy image
os.system(f'powershell -Command "Copy-Item -Force {img_src} src/assets/img/modal_bus_reader.png"')
os.system(f'powershell -Command "Copy-Item -Force {img_src} docs/assets/img/modal_bus_reader.png"')

# 1. Update CSS
css_path = os.path.join(BASE_DIR, 'src', 'assets', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Make .glass-dialog perfectly centered and handle overflow
if 'transform: translate(-50%, -50%);' not in css_content:
    # Replace .glass-dialog block
    old_dialog = '''.glass-dialog {
    border: 1px solid rgba(139,58,31,0.2);
    border-radius: var(--radius-xl);
    background: rgba(251,247,239,0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 25px 50px rgba(0,0,0,0.15);
    padding: 0;
    width: 90%;
    max-width: 800px;
    color: var(--ink);
}'''
    
    new_dialog = '''.glass-dialog {
    border: 1px solid rgba(139,58,31,0.2);
    border-radius: var(--radius-xl);
    background: rgba(251,247,239,0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 25px 50px rgba(0,0,0,0.15);
    padding: 0;
    width: 90%;
    max-width: 800px;
    color: var(--ink);
    
    /* Centering and Responsiveness */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    max-height: 85vh;
    overflow-y: auto;
}'''
    
    css_content = css_content.replace(old_dialog, new_dialog)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

# 2. Update HTML
html_files = [
    os.path.join(BASE_DIR, 'src', 'index.html'),
    os.path.join(BASE_DIR, 'src', 'pt.html')
]

img_tag_en = '<img src="assets/img/modal_bus_reader.png" alt="Bald Black woman reading a book on a bus" style="float: right; width: 110px; height: 110px; object-fit: cover; border-radius: 50%; margin: 5px 0 10px 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">'
img_tag_pt = '<img src="assets/img/modal_bus_reader.png" alt="Mulher negra careca lendo um livro em um ônibus" style="float: right; width: 110px; height: 110px; object-fit: cover; border-radius: 50%; margin: 5px 0 10px 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">'

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    if 'modal_bus_reader.png' not in html:
        img_tag = img_tag_pt if 'pt.html' in filepath else img_tag_en
        
        # Insert inside dialog-section for Ecosystem
        # Find <h4>The iScrev Ecosystem</h4> or <h4>O Ecossistema iScrev</h4>
        # We will insert it right after the <h4>
        html = re.sub(r'(<h4>The iScrev Ecosystem</h4>)', r'\1\n                ' + img_tag, html)
        html = re.sub(r'(<h4>O Ecossistema iScrev</h4>)', r'\1\n                ' + img_tag, html)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)

print("Updated CSS and HTML")
