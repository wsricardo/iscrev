import re

with open('c:/Users/wsric/iscrev/src/pt.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix main-section-1 closing
content = re.sub(r'(<article class="info-card">.*?<\/article>\s*)\n\s*<section class="main-section main-section-2">', r'\1\n                </div>\n            </section>\n\n            <section class="main-section main-section-2">', content, flags=re.DOTALL)

# Fix main-section-2 closing
content = re.sub(r'(<article class="feature-row">.*?<\/article>\s*)\n\s*<section class="main-section main-section-3">', r'\1\n                    </div>\n                </div>\n            </section>\n\n            <section class="main-section main-section-3">', content, flags=re.DOTALL)

# Fix main-section-3 closing
content = re.sub(r'(<article class="step-card">.*?<\/article>\s*)\n\s*<article class="card">', r'\1\n                </div>\n            </section>\n\n            <section class="main-section main-section-blog">\n                <article class="card">', content, flags=re.DOTALL)

with open('c:/Users/wsric/iscrev/src/pt.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed pt.html')
