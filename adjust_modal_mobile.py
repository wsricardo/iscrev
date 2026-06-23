import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
css_path = os.path.join(BASE_DIR, 'src', 'assets', 'css', 'style.css')

with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# I will replace the existing @media (max-width: 768px) block that contains the dialog mobile styles
# and enhance it.

old_media_pattern = r'@media \(max-width: 768px\) \{\s*\.dialog-content \{.*?\.eco-card \{\s*flex: 0 0 calc\(85\%\);\s*\}\s*\}'
# wait, actually the media query I wrote earlier is:
'''
@media (max-width: 768px) {
    .dialog-content {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 20px;
    }
    .dialog-section-author {
        border-left: none;
        padding-left: 0;
        border-top: 1px solid rgba(139,58,31,0.1);
        padding-top: 20px;
    }
    .support-section {
        grid-column: 1;
    }
    .dialog-section img {
        width: 80px !important;
        height: 80px !important;
        margin: 5px 0 10px 10px !important;
    }
    .eco-card {
        flex: 0 0 calc(85%);
    }
}
'''

# Let's just find where `.eco-card {` is inside `@media (max-width: 768px)`
# and replace the whole block carefully.
# Or better yet, just append another `@media (max-width: 768px)` at the bottom of the file!
# CSS later rules override earlier ones.

mobile_overrides = '''
@media (max-width: 768px) {
    .glass-dialog {
        width: 95% !important;
        max-height: 90vh !important;
    }
    .dialog-header {
        padding: 15px 20px !important;
    }
    .dialog-header h3 {
        font-size: 1.25rem !important;
    }
    .dialog-content {
        padding: 15px !important;
        gap: 15px !important;
    }
    .dialog-section h4 {
        font-size: 1.15rem !important;
        margin-bottom: 8px !important;
    }
    .dialog-section p {
        font-size: 0.95rem !important;
        margin-bottom: 12px !important;
        line-height: 1.4 !important;
    }
    .dialog-section-author {
        padding-top: 15px !important;
    }
    .support-section {
        padding-top: 15px !important;
    }
    .support-section .button-primary {
        padding: 10px 15px !important;
        font-size: 0.95rem !important;
    }
    .social-links {
        gap: 8px !important;
    }
    .social-link {
        padding: 6px 12px !important;
        font-size: 0.85rem !important;
    }
    .dialog-section img {
        width: 70px !important;
        height: 70px !important;
        margin: 0 0 5px 10px !important;
    }
}
'''

# Append to file
with open(css_path, 'a', encoding='utf-8') as f:
    f.write(mobile_overrides)

# Also update html cache buster
html_files = [
    os.path.join(BASE_DIR, 'src', 'index.html'),
    os.path.join(BASE_DIR, 'src', 'pt.html')
]

for filepath in html_files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # update the link tag
        html = re.sub(r'href="assets/css/style\.css\?v=2\.1"', 'href="assets/css/style.css?v=2.2"', html)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)

print("CSS refined for mobile")
