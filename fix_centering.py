import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Fix CSS
css_path = os.path.join(BASE_DIR, 'src', 'assets', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Make .glass-dialog perfectly centered with !important
old_dialog = '''.glass-dialog {
    border: 1px solid rgba(139, 58, 31, 0.2);
    border-radius: var(--radius-xl);
    background: rgba(251, 247, 239, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    padding: 0;
    width: 90%;
    max-width: 800px;
    color: var(--ink);
    
    /* Native centering */
    margin: auto;
    max-height: 85vh;
    overflow-y: auto;
}'''

new_dialog = '''.glass-dialog {
    border: 1px solid rgba(139, 58, 31, 0.2);
    border-radius: var(--radius-xl);
    background: rgba(251, 247, 239, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    padding: 0;
    width: 90%;
    max-width: 800px;
    color: var(--ink);
    
    /* Absolute Centering */
    margin: 0 !important;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    max-height: 85vh;
    overflow-y: auto;
}'''

if old_dialog in css_content:
    css_content = css_content.replace(old_dialog, new_dialog)
else:
    css_content = re.sub(r'\.glass-dialog\s*\{[^}]*\}', new_dialog, css_content)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

# 2. Add Cache buster to HTML
html_files = [
    os.path.join(BASE_DIR, 'src', 'index.html'),
    os.path.join(BASE_DIR, 'src', 'pt.html')
]

for filepath in html_files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # update the link tag
        html = re.sub(r'href="assets/css/style\.css(\?v=\d+\.\d+)?"', 'href="assets/css/style.css?v=2.1"', html)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)

print("Fixed CSS and added cache buster")
