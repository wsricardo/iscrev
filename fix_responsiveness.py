import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Update style.css
css_path = os.path.join(BASE_DIR, 'src', 'assets', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    style_content = f.read()

# Replace panel-paper padding
style_content = style_content.replace(
    '.panel-paper {\n        padding: 24px 20px 24px 58px;\n    }',
    '.panel-paper {\n        padding: 24px 20px 24px 20px;\n    }'
)

# Add gap: 20px to grids in 720px media query
grids_old = '''.cards-grid,
    .steps-grid,
    .principles-grid,
    .audience-grid {
        grid-template-columns: 1fr;
    }'''
grids_new = '''.cards-grid,
    .steps-grid,
    .principles-grid,
    .audience-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }'''
style_content = style_content.replace(grids_old, grids_new)

feature_old = '''.feature-row {
        grid-template-columns: 1fr;
    }'''
feature_new = '''.feature-row {
        grid-template-columns: 1fr;
        gap: 20px;
    }'''
style_content = style_content.replace(feature_old, feature_new)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(style_content)


# 2. Update style-blog.css
blog_css_path = os.path.join(BASE_DIR, 'src', 'assets', 'css', 'style-blog.css')
with open(blog_css_path, 'r', encoding='utf-8') as f:
    blog_content = f.read()

blog_old = '''@media (max-width: 720px) {
    .blog-page-header,
    .article-hero,
    .article-body {
        padding: 24px;
        border-radius: 24px;
    }
    .article-body {
        max-width: 100%;
    }
}'''

blog_new = '''@media (max-width: 720px) {
    .blog-page-header,
    .article-hero,
    .article-body {
        padding: 20px;
        border-radius: 20px;
    }
    .article-body {
        max-width: 100%;
    }
    .article-body img {
        max-width: 100%;
        margin: 14px 0;
    }
}

@media (max-width: 480px) {
    .blog-page-header,
    .article-hero,
    .article-body {
        padding: 16px;
        border-radius: 16px;
    }
}'''

blog_content = blog_content.replace(blog_old, blog_new)

with open(blog_css_path, 'w', encoding='utf-8') as f:
    f.write(blog_content)

print("Updated responsiveness in CSS files")
